<?php
/** GET /api/health — for uptime monitors. Says nothing about configuration. */

declare(strict_types=1);

require __DIR__ . '/_lib.php';

respond(200, ['ok' => true]);
