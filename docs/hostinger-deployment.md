# Hostinger deployment

This project runs as a Node.js application on Hostinger. The production build creates a Vite client bundle in `dist/` and a compiled Express server in `dist-server/`.

## 1. Create the application

In Hostinger hPanel, create or open a Node.js application for the domain. Use Node.js 22.22.2 or newer (the repository pins 22.23.1 in `.nvmrc`); the dependency lockfile requires this runtime floor. Confirm the selected Hostinger Node.js application supports that version before deploying. Set the application root to the project directory and use the production environment. Do not upload `node_modules`; install dependencies on the server or deploy them through the hosting workflow.

Use these application commands:

- Install command: `npm ci` (installs exactly what `package-lock.json` records)
- Build command: `npm run build`
- Start command: `npm start`

The start command runs `dist-server/index.js` with `NODE_ENV=production`. It serves the prerendered pages in `dist/` plus the `/api/contact` and `/api/notify` endpoints. If `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, or `CONTACT_FROM` is missing, the site still comes up. The server logs a warning naming the missing settings, and both forms tell visitors to email the label directly. After deploying, check the startup log for that warning and send one test message through each form.

## 2. Port handling

Hostinger provides the public application port. The server reads the `PORT` environment variable automatically, so do not hard-code a public port. For local production checks, use a temporary value such as `PORT=4173 npm start`; in Hostinger, leave `PORT` set to the port assigned by the Node.js application panel if the panel provides one.

## 3. Environment variables

Add these variables in the Hostinger application settings:

| Variable | Purpose |
| --- | --- |
| `PORT` | Port supplied by Hostinger for the running Node.js process. |
| `SMTP_HOST` | Hostname of the SMTP provider. |
| `SMTP_PORT` | SMTP port, commonly `465` for implicit TLS or `587` for STARTTLS. |
| `SMTP_SECURE` | Set to `true` for an implicit-TLS connection such as port 465; otherwise use `false`. |
| `SMTP_USER` | SMTP account username. |
| `SMTP_PASSWORD` | SMTP account password or provider-issued app password. |
| `CONTACT_FROM` | Verified sender address used for outgoing contact mail. |

Never commit these values to `.env`, source files, or the repository. If the SMTP provider requires a separate sender identity, verify that identity before deploying.

## Local development

Use Node.js 22.22.2 or newer locally as well. The development command starts Vite on its usual port and the Express contact server on port `3000`; Vite proxies `/api` requests to Express, so the browser contact form works without a separate frontend URL setting.

Before starting the app, export the same SMTP settings that production uses. For example:

```bash
export SMTP_HOST=smtp.example.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=local-mailer@example.com
export SMTP_PASSWORD=your-local-app-password
export CONTACT_FROM=local-mailer@example.com
npm install
npm run dev
```

Keep those values in your shell profile or another local secret-management mechanism; do not commit them. Visit the Vite URL printed by `npm run dev` and submit `/contact` to verify delivery. Use `Ctrl+C` once to stop both the Vite and Express processes.

## 4. SMTP setup

Create or choose an SMTP mailbox/provider that permits application mail. Use the provider’s hostname, port, TLS mode, username, and password for the five `SMTP_*` variables. Set `CONTACT_FROM` to a verified address on that provider. The form sends replies to the visitor’s submitted email through `replyTo`; it does not use visitor-controlled addresses as the sender.

After saving the variables, restart the Node.js application. Submit a test enquiry from `/contact` and confirm delivery to the configured Haltris support, collaboration, or artist-submissions inbox. Check the provider’s delivery logs if the request succeeds but mail does not arrive.

## 5. Deploy and verify

From the project directory, install and build the application, then start it through Hostinger’s Node.js process manager:

```bash
npm ci
npm run build
npm start
```

The build writes a complete HTML file for every route (`dist/index.html`, `dist/artists/index.html`, `dist/artists/lil-sukku/index.html`, and so on), plus `dist/404.html`, `dist/sitemap.xml`, and `dist/robots.txt`. Adding an artist to `src/content/artists.ts` adds its page and sitemap entry on the next build.

Confirm that:

- `/`, `/artists`, `/artists/lil-sukku`, `/releases`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, and `/release-disclaimer` return 200 with their own title and page content in the HTML.
- An unknown address such as `/artists/nobody` returns 404 with the not-found page.
- `/artists/` redirects (301) to `/artists`.
- `/sitemap.xml` and `/robots.txt` load.
- Files under `/assets/` are sent with `Cache-Control: public, max-age=31536000, immutable`.

Security headers (Content-Security-Policy, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are set by the Express server. HSTS only takes effect over HTTPS, so make sure the domain has an SSL certificate enabled in hPanel.

If the selected Hostinger plan only supports static hosting, upload `dist/` instead and configure the host to serve `404.html` for unknown routes. Every page is prerendered, so the site works that way, but the contact form requires a Node.js-capable host or a separate compatible form handler, and the security headers must then be set in the host's configuration.
