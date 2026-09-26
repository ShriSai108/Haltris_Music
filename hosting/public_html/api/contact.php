<?php
/** POST /api/contact — the contact form. Same rules and answers as server/contact.ts. */

declare(strict_types=1);

require __DIR__ . '/_lib.php';

const RECIPIENTS = [
    'general' => 'support@haltris.com',
    'collaboration' => 'collaboration@haltris.com',
    'artist' => 'artist@haltris.com',
];

$data = read_json_request();

if (!rate_limit_accept('contact')) {
    respond(429, ['ok' => false, 'message' => RETRY_MESSAGE]);
}

$name = text_field($data, 'name', 120, true);
$email = valid_email($data['email'] ?? null);
$inquiryType = is_string($data['inquiryType'] ?? null) && isset(RECIPIENTS[$data['inquiryType']]) ? $data['inquiryType'] : null;
$message = text_field($data, 'message', 5000, true);
$url = text_field($data, 'url', 500, false);
$company = text_field($data, 'company', 200, false);

$urlValid = $url === '' || ($url !== null && filter_var($url, FILTER_VALIDATE_URL) && preg_match('#^https?://#i', $url));

if ($name === null || $email === null || $inquiryType === null || $message === null || !$urlValid
    || $company === null || ($data['consent'] ?? null) !== true) {
    respond(400, ['ok' => false, 'message' => 'Please check the form and try again.']);
}

// A filled honeypot gets a normal "thanks", so bots learn nothing, but nothing is sent.
if ($company !== '') {
    respond(200, ['ok' => true]);
}

$config = load_config();
if ($config === null) {
    respond(503, ['ok' => false, 'message' => UNAVAILABLE_MESSAGE]);
}

$lines = [
    'Name: ' . $name,
    'Email: ' . $email,
    'Inquiry type: ' . $inquiryType,
];
if ($url !== '') {
    $lines[] = 'URL: ' . $url;
}
$lines[] = '';
$lines[] = $message;

$sent = send_mail(
    $config,
    RECIPIENTS[$inquiryType],
    $email,
    'Haltris ' . $inquiryType . ' enquiry from ' . $name,
    implode("\n", $lines),
);

if (!$sent) {
    respond(500, ['ok' => false, 'message' => 'Unable to send your message right now.']);
}

respond(200, ['ok' => true]);
