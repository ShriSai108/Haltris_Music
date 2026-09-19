# Hostinger deployment

This project runs as a Node.js application on Hostinger. The production build creates a Vite client bundle in `dist/` and a compiled Express server in `dist-server/`.

## 1. Create the application

In Hostinger hPanel, create or open a Node.js application for the domain. Use Node.js 20 or newer. Set the application root to the project directory and use the production environment. Do not upload `node_modules`; install dependencies on the server or deploy them through the hosting workflow.

Use these application commands:

- Build command: `npm run build`
- Start command: `npm start`

The start command runs `dist-server/index.js`, which serves the built frontend and the `/api/contact` endpoint.

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

## 4. SMTP setup

Create or choose an SMTP mailbox/provider that permits application mail. Use the provider’s hostname, port, TLS mode, username, and password for the five `SMTP_*` variables. Set `CONTACT_FROM` to a verified address on that provider. The form sends replies to the visitor’s submitted email through `replyTo`; it does not use visitor-controlled addresses as the sender.

After saving the variables, restart the Node.js application. Submit a test enquiry from `/contact` and confirm delivery to the configured Haltris support, collaboration, or artist-submissions inbox. Check the provider’s delivery logs if the request succeeds but mail does not arrive.

## 5. Deploy and verify

From the project directory, install and build the application, then start it through Hostinger’s Node.js process manager:

```bash
npm install
npm run build
npm start
```

Confirm that the domain serves `/` and that direct navigation to `/artists`, `/artists/lil-sukku`, `/releases`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, and `/release-disclaimer` returns the app shell. The Express catch-all route is required so browser refreshes on client-side routes continue to work.

If the selected Hostinger plan only supports static hosting, upload `dist/` instead and configure the host to rewrite unknown routes to `index.html`. The browser pages remain deployable this way, but the Express contact endpoint and SMTP-backed form require a Node.js-capable host or a separate compatible form handler.
