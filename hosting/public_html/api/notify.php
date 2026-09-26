<?php
/** POST /api/notify — "Tell me when it's out". Same rules and answers as server/notify.ts. */

declare(strict_types=1);

require __DIR__ . '/_lib.php';

const NOTIFY_RECIPIENT = 'support@haltris.com';

$data = read_json_request();

if (!rate_limit_accept('notify')) {
    respond(429, ['ok' => false, 'message' => RETRY_MESSAGE]);
}

$email = valid_email($data['email'] ?? null);
$release = text_field($data, 'release', 120, false);
$company = text_field($data, 'company', 200, false);

if ($email === null || $release === null || $company === null || ($data['consent'] ?? null) !== true) {
    respond(400, ['ok' => false, 'message' => 'Enter a valid email address.']);
}

if ($company !== '') {
    respond(200, ['ok' => true]);
}

$config = load_config();
if ($config === null) {
    respond(503, ['ok' => false, 'message' => UNAVAILABLE_MESSAGE]);
}

$sent = send_mail(
    $config,
    NOTIFY_RECIPIENT,
    $email,
    'Release alert signup: ' . $email,
    implode("\n", [
        'Email: ' . $email,
        'Release: ' . ($release !== '' ? $release : 'Any new release'),
        'They agreed to one email when this release is out.',
    ]),
);

if (!$sent) {
    respond(500, ['ok' => false, 'message' => 'We could not save that right now.']);
}

respond(200, ['ok' => true]);
