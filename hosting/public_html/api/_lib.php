<?php
/**
 * Shared helpers for the contact and release alert forms on PHP hosting
 * (Hostinger shared and WordPress plans). Mirrors server/contact.ts and
 * server/notify.ts, which do the same job on Node hosting.
 *
 * Settings live in haltris-config.php in the folder that holds public_html,
 * so the mail password can never be downloaded from the website.
 */

declare(strict_types=1);

const RETRY_MESSAGE = 'Please wait a moment and try again.';
const UNAVAILABLE_MESSAGE = 'The form is resting for a moment. Email us directly instead.';
const MAX_BODY_BYTES = 20 * 1024;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const RATE_LIMIT_MAX_REQUESTS = 5;

/** Sends a JSON answer and stops. */
function respond(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * The folder that holds the outermost public_html, which the web can never reach.
 * Works for a main domain (public_html/api) and for a subdomain that Hostinger
 * nests inside it (public_html/music/api) alike.
 */
function private_directory(): string
{
    $outermost = null;
    for ($directory = dirname(__DIR__); $directory !== dirname($directory); $directory = dirname($directory)) {
        if (basename($directory) === 'public_html') {
            $outermost = $directory;
        }
    }

    return dirname($outermost ?? dirname(__DIR__));
}

/** Reads the settings file, or null when it is missing or incomplete. */
function load_config(): ?array
{
    $file = private_directory() . '/haltris-config.php';
    if (!is_file($file)) {
        return null;
    }

    $config = require $file;
    if (!is_array($config) || !is_string($config['from'] ?? null) || !filter_var($config['from'], FILTER_VALIDATE_EMAIL)) {
        return null;
    }

    $smtp = $config['smtp'] ?? [];
    if (!is_array($smtp)) {
        return null;
    }

    // With an SMTP host set, the login is required too. Without one, PHP mail() is used.
    if (trim((string) ($smtp['host'] ?? '')) !== ''
        && (trim((string) ($smtp['user'] ?? '')) === '' || (string) ($smtp['password'] ?? '') === '')) {
        return null;
    }

    return $config;
}

/** Accepts only a small JSON POST and returns the decoded object. */
function read_json_request(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        respond(405, ['ok' => false, 'message' => 'Not allowed']);
    }

    $raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
    if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
        respond(413, ['ok' => false, 'message' => 'Too large']);
    }

    $data = json_decode($raw, true);
    return is_array($data) && !array_is_list($data) ? $data : [];
}

/**
 * Five sends per visitor per ten minutes, per form. Counts are kept in small
 * files outside the website folder, keyed by a hash of the visitor's address.
 */
function rate_limit_accept(string $form): bool
{
    $directory = private_directory() . '/.form-limits';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        $directory = sys_get_temp_dir() . '/form-limits-' . md5(private_directory());
        if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
            return true; // Never block real people because the disk is not writable.
        }
    }

    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $handle = @fopen($directory . '/' . hash('sha256', $form . '|' . $ip), 'c+');
    if ($handle === false) {
        return true;
    }

    try {
        flock($handle, LOCK_EX);
        $now = time();
        $stored = json_decode((string) stream_get_contents($handle), true);
        $recent = array_values(array_filter(
            is_array($stored) ? $stored : [],
            static fn ($timestamp) => is_int($timestamp) && $timestamp > $now - RATE_LIMIT_WINDOW_SECONDS,
        ));

        $accepted = count($recent) < RATE_LIMIT_MAX_REQUESTS;
        if ($accepted) {
            $recent[] = $now;
        }

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($recent));
        return $accepted;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/** A trimmed string field, or null when it is missing, not text, or too long. */
function text_field(array $data, string $key, int $maxLength, bool $required): ?string
{
    $value = $data[$key] ?? '';
    if (!is_string($value)) {
        return null;
    }

    $value = trim($value);
    if (($required && $value === '') || mb_strlen($value) > $maxLength) {
        return null;
    }

    return $value;
}

function valid_email(mixed $value): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $value = trim($value);
    return strlen($value) <= 254 && filter_var($value, FILTER_VALIDATE_EMAIL) ? $value : null;
}

/** Removes line breaks so a value can never add its own email headers. */
function header_safe(string $value): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $value) ?? '');
}

function encode_header(string $value): string
{
    $value = header_safe($value);
    return preg_match('/^[\x20-\x7E]*$/', $value) ? $value : '=?UTF-8?B?' . base64_encode($value) . '?=';
}

/** Sends one plain text email through SMTP when configured, otherwise PHP mail(). */
function send_mail(array $config, string $to, string $replyTo, string $subject, string $text): bool
{
    $from = $config['from'];
    $fromName = header_safe((string) ($config['from_name'] ?? 'Website'));
    $domain = substr(strrchr($from, '@') ?: '@localhost', 1);

    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . encode_header($fromName) . ' <' . $from . '>',
        'Reply-To: ' . header_safe($replyTo),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    // Base64 keeps every line short and ASCII, and no line can start with a dot.
    $body = rtrim(chunk_split(base64_encode($text), 76, "\r\n"));

    $smtp = $config['smtp'] ?? [];
    if (trim((string) ($smtp['host'] ?? '')) === '') {
        return mail($to, encode_header($subject), $body, implode("\r\n", $headers), '-f' . $from);
    }

    $message = implode("\r\n", array_merge(
        $headers,
        ['To: ' . $to, 'Subject: ' . encode_header($subject)],
    )) . "\r\n\r\n" . $body;

    return smtp_send($smtp, $from, $to, $domain, $message);
}

/** A minimal SMTP client: implicit TLS (465), STARTTLS (587), or plain for local tests. */
function smtp_send(array $smtp, string $from, string $to, string $heloName, string $message): bool
{
    $host = (string) $smtp['host'];
    $secure = strtolower((string) ($smtp['secure'] ?? 'ssl'));
    $port = (int) ($smtp['port'] ?? ($secure === 'ssl' ? 465 : 587));
    $context = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'peer_name' => $host]]);

    $socket = @stream_socket_client(
        ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port,
        $errorNumber,
        $errorText,
        15,
        STREAM_CLIENT_CONNECT,
        $context,
    );
    if ($socket === false) {
        error_log("Form mail: could not connect to the mail server ($errorText)");
        return false;
    }
    stream_set_timeout($socket, 20);

    $expect = static function (array $codes) use ($socket): bool {
        do {
            $line = fgets($socket, 1024);
            if ($line === false) {
                return false;
            }
        } while (isset($line[3]) && $line[3] === '-');

        if (!in_array((int) substr($line, 0, 3), $codes, true)) {
            error_log('Form mail: mail server said ' . trim($line));
            return false;
        }
        return true;
    };
    $command = static function (string $line, array $codes) use ($socket, $expect): bool {
        return fwrite($socket, $line . "\r\n") !== false && $expect($codes);
    };

    try {
        $ok = $expect([220]) && $command('EHLO ' . $heloName, [250]);

        if ($ok && $secure === 'tls') {
            $ok = $command('STARTTLS', [220])
                && stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)
                && $command('EHLO ' . $heloName, [250]);
        }

        $user = (string) ($smtp['user'] ?? '');
        if ($ok && $user !== '') {
            $ok = $command('AUTH LOGIN', [334])
                && $command(base64_encode($user), [334])
                && $command(base64_encode((string) $smtp['password']), [235]);
        }

        $ok = $ok
            && $command('MAIL FROM:<' . $from . '>', [250])
            && $command('RCPT TO:<' . $to . '>', [250, 251])
            && $command('DATA', [354])
            && $command($message . "\r\n.", [250]);

        $command('QUIT', [221]);
        return $ok;
    } finally {
        fclose($socket);
    }
}
