<?php
/**
 * Mail settings for the contact and release alert forms.
 *
 * 1. Rename this file to haltris-config.php.
 * 2. Upload it to the folder that CONTAINS public_html (on Hostinger:
 *    domains/haltris.com/), never inside public_html.
 * 3. Fill in the password of the mailbox you created in hPanel → Emails.
 *
 * Until this file exists, the site works and both forms ask visitors to
 * email the label directly.
 */

return [
    // The mailbox the website sends from. It must be a real Hostinger mailbox.
    'from' => 'support@haltris.com',
    'from_name' => 'Haltris Music website',

    // Hostinger email: smtp.hostinger.com, port 465, 'ssl'.
    // Leave 'host' empty to use PHP's built in mail() instead (less reliable delivery).
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'secure' => 'ssl', // 'ssl' for port 465, 'tls' for port 587
        'user' => 'support@haltris.com',
        'password' => '',
    ],
];
