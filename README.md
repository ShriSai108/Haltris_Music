# Haltris Music

Haltris Music is an independent label website for discovering artists, releases, and label information. It is a Vite + React site. Every route is prerendered to static HTML at build time and then becomes interactive in the browser. A small Express server serves the pages and the contact endpoint.

## Requirements

- Node.js 22.22.2 or newer (`.nvmrc` pins 22.23.1; run `nvm use`)
- npm

## Local development

```bash
npm ci
npm run dev
```

This starts the Vite development server and the Express contact server together. Run the tests once with `npm test`, or keep them running with `npm run test:watch`.

## Production

```bash
npm run build
npm start
```

`npm run build` type-checks the project, builds the browser bundle into `dist/`, renders every route to HTML (plus `404.html`, `sitemap.xml`, and `robots.txt`), and compiles the server into `dist-server/`. `npm run preview` builds and starts in one step.

The server listens on `PORT` (default `3000`). It returns a real 404 for unknown pages, redirects trailing slashes, caches hashed assets for a year, and sets security headers.

For Hostinger Node.js deployment, see [docs/hostinger-deployment.md](docs/hostinger-deployment.md).

## Content

All site copy lives in `src/content/`:

- `artists.ts`: roster, images, pronouns (used in copy such as "Read her profile"), and optional social links.
- `releases.ts`: releases, with optional `releaseDate`, `cover`, and streaming or pre-save `links`, which appear once filled in.
- `site.ts`: navigation, email routes, enquiry types, and label social links (`socials`), which appear in the footer and search data once added.

Page titles, descriptions, social cards, and structured data come from `src/app/metadata.ts` only.

Source artwork lives in `assets-src/`. The optimised images in `public/images/` are generated from it, for example:

```bash
for w in 480 800 1254; do cwebp -q 80 -resize $w 0 assets-src/lil-sukku-profile.png -o public/images/lil-sukku-$w.webp; done
```

## Contact email configuration

The contact form needs SMTP settings at runtime: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `CONTACT_FROM` (see `.env.example`). Keep credentials out of source control. Without them the site still runs, but the contact and release alert forms answer with "email us directly" and the server logs a warning at startup. Release alert signups (`/api/notify`) are emailed to support@haltris.com, one message per signup. Deep links such as `/contact?type=artist` or `/contact?type=collaboration` preselect the enquiry type.

## Content to fill before launch

These are left blank on purpose rather than invented. Each one appears on the site automatically once filled in.

- `src/content/releases.ts`: the song `title`, `releaseDate`, `cover`, `presaveUrl`, and streaming `links`.
- `src/content/artists.ts`: Lil' Sukku's `socials`.
- `src/content/site.ts`: the label's `socials`.
- Analytics: none is installed. Pick a provider first, since it changes the privacy and cookie policies and the Content Security Policy in `server/index.ts`.
