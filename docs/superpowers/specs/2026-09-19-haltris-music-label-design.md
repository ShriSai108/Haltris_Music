# Haltris Music Label Website Design

## Goal

Create a polished, dark-themed music-label website for Haltris with a cinematic Three.js experience, a clear path to explore artists and upcoming releases, and a deployment model that works on Hostinger.

## Audience and Positioning

Haltris is an India-based music label launching with Lil' Sukku as its first artist and planning to add more artists over time. The site should feel like a label home rather than a generic artist landing page: confident, minimal, nocturnal, and discovery-oriented.

## Approved Experience

- Black and white foundation with purple as the only accent color.
- 3D visuals are silent by default; an explicit Enable Sound interaction may start an optional ambient audio layer.
- The 3D experience must remain smooth on desktop and mobile through responsive sizing, capped render density, animation throttling when the tab is hidden, and a reduced-complexity mobile scene.
- No social links until the label provides them.
- Lil' Sukku is shown as the first artist.
- The album preview at `https://toolost.com/release-preview/MTcyMTY0Mw` is labeled as an upcoming release/preview, not as a released album.
- Copy is written in a polished, launch-ready voice.

## Pages

1. Home — 3D hero, Haltris positioning, featured artist/release, concise navigation.
2. Artists — artist index designed to grow beyond Lil' Sukku.
3. Artist detail — Lil' Sukku profile, visual treatment, and release preview CTA.
4. Releases — upcoming/preview release cards with status labels.
5. About — label story and point of view.
6. Contact — inquiry selector for Support, Collaboration, or Artist submissions; text and links only.
7. Privacy Policy — India-oriented standard draft.
8. Terms of Use — standard site, content, and release-preview terms.
9. Cookie Policy — describes essential cookies and optional analytics treatment.
10. Content / Release Disclaimer — clarifies preview status, rights, and availability.

## Content and Contact Rules

- Contact emails:
  - `support@haltris.com`
  - `Collaboration@haltris.com`
  - `Artist@haltris.com`
- Contact form fields: name, email, inquiry type, message, optional URL, consent checkbox.
- No file uploads.
- Server-side form delivery is configured through environment variables so credentials are not committed.
- Legal pages identify Haltris Music and the supplied Bengaluru address:
  `234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram, Bengaluru, Karnataka 560016`.
- Legal copy is a practical launch draft and should be reviewed by an Indian-qualified legal professional before publication.

## Visual System

- Near-black background with off-white type and muted grayscale surfaces.
- Purple accent reserved for active states, primary CTAs, 3D light energy, and focus rings.
- Large display typography, restrained uppercase labels, generous negative space, subtle grain, and thin rules.
- 3D scene: abstract orbital/sonic geometry with a soft purple emissive core, pointer-responsive parallax, and gentle motion. It must never compete with readable content.
- Accessibility: visible focus states, semantic landmarks, keyboard navigation, reduced-motion support, contrast-safe text, and a non-WebGL fallback surface.

## Architecture

Use a small Node.js application with an Express server and a Vite-powered frontend. Content lives in typed data modules so new artists and releases can be added without introducing a CMS. React owns page layout and routing; Three.js is isolated in a hero scene component with a plain HTML/CSS fallback. The server exposes a single contact endpoint that validates input and sends email through SMTP configured with environment variables.

Hostinger deployment should support a Node.js application entrypoint, a production build command, and environment variables for SMTP. If the selected Hostinger plan only supports static hosting, the frontend build remains deployable as static files, while the contact endpoint can be pointed at a Hostinger-compatible mail form handler.

## Quality Bar

- `npm run build` completes successfully.
- The production server starts with `npm start`.
- All defined routes render without console errors.
- The contact endpoint rejects invalid input and never exposes SMTP credentials.
- 3D degrades gracefully when WebGL is unavailable or reduced motion is preferred.
- Mobile layout is usable at narrow widths without horizontal overflow.
- Policy pages are linked from the footer and readable without animation.

