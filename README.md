# Haltris Music

Haltris Music is an independent label website for discovering artists, releases, and label information. The frontend is a Vite + React single-page application, and a small Express server serves the production build and the contact endpoint.

## Requirements

- Node.js 20 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

The Vite development server runs on its default local port. Use `npm test -- --run` to run the test suite.

## Production

Build both the browser bundle and the server bundle with:

```bash
npm run build
npm start
```

The server uses `PORT` when provided and otherwise listens on port `3000`. It serves the `dist/` browser build and falls back to `index.html` for client-side routes. The generated server files are written to `dist-server/`.

For Hostinger Node.js deployment, see [docs/hostinger-deployment.md](docs/hostinger-deployment.md).

## Contact email configuration

The contact form requires SMTP environment variables at runtime. Keep credentials out of source control. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_FROM`, and `PORT` in the hosting environment; the deployment guide explains each setting and the recipient routing.

## Public routes

The site includes the home, artists, artist detail, releases, about, contact, privacy, terms, cookies, and release disclaimer routes. The static HTML shell also contains a concise email fallback for visitors who have JavaScript disabled.
