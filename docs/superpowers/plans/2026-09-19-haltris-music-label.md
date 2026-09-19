# Haltris Music Label Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, static-content Haltris music-label website with a responsive Three.js hero, Lil' Sukku preview-release content, legal pages, and an SMTP-backed contact form deployable on Hostinger.

**Architecture:** A Vite + React frontend renders all public pages from typed content modules. A small Express server serves the production `dist` directory and exposes `/api/contact`; the server validates and routes form submissions through SMTP environment variables. The Three.js scene is isolated behind a reusable hero component with reduced-motion and WebGL fallback behavior.

**Tech Stack:** Node.js 20+, TypeScript, React, Vite, Three.js, Express, Nodemailer, Zod, Vitest, React Testing Library, CSS modules/global CSS, Hostinger Node.js application runtime.

**Repository note:** The supplied workspace is not currently a Git repository, so the commit steps below are checkpoints to use if version control is initialized before implementation; otherwise, skip the commit command and keep the files in the workspace.

## Global Constraints

- Use a black/off-white visual foundation and purple as the only accent.
- Keep the 3D experience silent by default; sound can only start after an explicit user interaction.
- Keep the experience smooth on desktop and mobile with capped pixel ratio, reduced scene complexity on narrow screens, and paused animation when hidden.
- Do not add social links.
- Label the Lil' Sukku album URL as an upcoming release preview.
- Do not store SMTP credentials in source control.
- Contact submissions accept text and links only; no file uploads.
- Include Home, Artists, Artist detail, Releases, About, Contact, Privacy Policy, Terms, Cookie Policy, and Release Disclaimer routes.
- Use the supplied Bengaluru address and contact emails in the contact/legal content.

---

### Task 1: Scaffold the Node/Vite application and deployment configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `server/index.ts`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/styles/global.css`

**Interfaces:**
- Produces a Vite dev server and a production Express entrypoint.
- `server/index.ts` serves `dist` and exposes `POST /api/contact` through a function imported from `server/contact.ts` in Task 5.

- [ ] **Step 1: Write the failing route smoke test**

Create `src/app/App.test.tsx` with a test that renders the app at `/` and expects the label name and primary navigation to be present.

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

it('renders the Haltris shell', () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
  expect(screen.getByText('HALTRIS')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /artists/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/app/App.test.tsx`
Expected: FAIL because the project files and dependencies do not exist.

- [ ] **Step 3: Add package and TypeScript/Vite configuration**

Define scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "start": "node --enable-source-maps dist-server/index.js",
    "test": "vitest"
  }
}
```

Use Node 20+, React, React Router, Three.js, Express, Nodemailer, Zod, Vitest, Testing Library, `tsx`, and the Vite React plugin. Configure a server-side TypeScript build that writes `server` to `dist-server` and a Vite build that writes the frontend to `dist`.

- [ ] **Step 4: Add the minimal app shell and global styles**

Create `App.tsx` with a semantic `<div id="root">`-compatible shell, a temporary `HALTRIS` wordmark, and a navigation link to `/artists`. Add `global.css` with the base font stack, `#0a0a0b` page background, off-white text, and purple focus styles.

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `npm test -- --run src/app/App.test.tsx`
Expected: PASS.

- [ ] **Step 6: Add deployment hygiene files**

`.env.example` must document `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_FROM`, and `PORT`. `.gitignore` must exclude `node_modules`, `dist`, `dist-server`, `.env`, and test coverage.

- [ ] **Step 7: Commit**

Run: `git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html .env.example .gitignore server/index.ts src && git commit -m "chore: scaffold Haltris music site"`

---

### Task 2: Build the content model, shared layout, and visual design system

**Files:**
- Create: `src/content/site.ts`
- Create: `src/content/artists.ts`
- Create: `src/content/releases.ts`
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/SiteFooter.tsx`
- Create: `src/components/SectionIntro.tsx`
- Create: `src/components/StatusPill.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles/global.css`
- Create: `src/styles/layout.css`
- Create: `public/haltris-logo.png` by copying `/Users/sanjaysharma/Downloads/Haltris_Logo.png`

**Interfaces:**
- `artists.ts` exports `artists: Artist[]` with `slug`, `name`, `shortBio`, `bio`, and `featured`.
- `releases.ts` exports `releases: Release[]` with `slug`, `title`, `artistSlug`, `status`, `previewUrl`, and `description`.
- `SiteHeader` consumes `site.navigation` and emits accessible internal links.

- [ ] **Step 1: Write content model tests**

Test that Lil' Sukku and the preview URL exist, that the release status is `upcoming`, and that no content item contains a social URL.

- [ ] **Step 2: Implement typed content modules**

Use the approved label copy and the exact data:

```ts
export const releases = [{
  slug: 'lil-sukku-debut-preview',
  title: "Lil' Sukku — Debut Preview",
  artistSlug: 'lil-sukku',
  status: 'upcoming',
  previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
  description: 'A first signal from Lil\' Sukku: sharp, restless, and built for the night.'
}] as const;
```

- [ ] **Step 3: Implement the shared header, footer, status pill, and layout tokens**

Use responsive nav with a keyboard-accessible menu button, visible focus rings, current-route styling, and a footer linking all policy pages plus the supplied office address and email routes.

- [ ] **Step 4: Copy the logo asset and add logo fallback behavior**

Copy the provided logo to `public/haltris-logo.png`. Render the image with `alt="Haltris"`; if it fails to load, retain the text wordmark so navigation remains usable.

- [ ] **Step 5: Run content and accessibility tests**

Run: `npm test -- --run src/content src/components`
Expected: PASS, with no social URL assertion failures.

- [ ] **Step 6: Commit**

Run: `git add public src/content src/components src/styles && git commit -m "feat: add Haltris content model and site shell"`

---

### Task 3: Implement the responsive Three.js hero and media controls

**Files:**
- Create: `src/components/ThreeHero.tsx`
- Create: `src/components/SoundToggle.tsx`
- Create: `src/hooks/useReducedMotion.ts`
- Create: `src/hooks/useWebGLSupport.ts`
- Create: `src/components/ThreeHero.test.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/styles/layout.css`

**Interfaces:**
- `ThreeHero` accepts `{ eyebrow: string; title: string; description: string }` and renders an accessible hero plus canvas/fallback.
- `SoundToggle` accepts `{ onEnable: () => void; enabled: boolean }` and never starts sound on mount.
- `useWebGLSupport()` returns a boolean.

- [ ] **Step 1: Write failing behavior tests**

Test that the hero renders the title, the Enable Sound button is present, and no audio element is playing on initial render. Test that reduced motion causes the scene to render a non-animated fallback class.

- [ ] **Step 2: Implement capability hooks and silent sound control**

`useReducedMotion` reads `prefers-reduced-motion` and subscribes to changes. `SoundToggle` calls `onEnable` only from a click or keyboard activation and sets `aria-pressed`.

- [ ] **Step 3: Implement the Three.js scene**

Create a scene with a dark background, a low-poly torus/knot or particle-orbit structure, purple emissive materials, ambient plus point lighting, a perspective camera, and pointer-responsive parallax. Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`; lower geometry/particle counts under 768px; pause the animation loop when `document.hidden`; dispose geometry/materials on unmount; render a CSS fallback when WebGL is unavailable or reduced motion is requested.

- [ ] **Step 4: Add hero styling and responsive behavior**

Keep copy above the canvas, preserve readable contrast, use `min-height: min(860px, 100svh)`, and switch to a smaller scene footprint on narrow screens without horizontal overflow.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- --run src/components/ThreeHero.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add src/components/ThreeHero.tsx src/components/SoundToggle.tsx src/hooks src/styles && git commit -m "feat: add responsive silent three hero"`

---

### Task 4: Build public pages and route-level content

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/ArtistsPage.tsx`
- Create: `src/pages/ArtistPage.tsx`
- Create: `src/pages/ReleasesPage.tsx`
- Create: `src/pages/AboutPage.tsx`
- Create: `src/pages/ContactPage.tsx`
- Create: `src/pages/LegalPage.tsx`
- Create: `src/content/legal.ts`
- Create: `src/pages/NotFoundPage.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles/layout.css`

**Interfaces:**
- Every page renders through the shared `SiteHeader` and `SiteFooter`.
- `ArtistPage` resolves an artist by slug and renders related releases by `artistSlug`.
- `LegalPage` accepts a `LegalDocument` with `slug`, `title`, `updatedLabel`, and `sections`.

- [ ] **Step 1: Write route and content tests**

Cover `/`, `/artists`, `/artists/lil-sukku`, `/releases`, `/about`, `/contact`, and all legal paths. Assert the preview CTA points to the Toolost URL and contains “Preview” or “Upcoming”.

- [ ] **Step 2: Implement React Router route map**

Define explicit routes and a catch-all 404. The header must expose Home, Artists, Releases, About, and Contact; policy routes remain in the footer.

- [ ] **Step 3: Implement the home page**

Use the ThreeHero, a featured Lil' Sukku block, a preview release card, label statement, and a clear “Explore artists” CTA.

- [ ] **Step 4: Implement artist and release pages**

Render the artist index from `artists`, render Lil' Sukku’s detail route, and render release cards from `releases`. The structure must allow adding another content object without new page markup.

- [ ] **Step 5: Implement About and Contact page shells**

Write the launch-ready label and artist copy. Contact page includes inquiry routing fields, email fallback links, consent language, and the supplied address.

- [ ] **Step 6: Implement legal documents**

Create India-oriented drafts for Privacy Policy, Terms, Cookie Policy, and Release Disclaimer. Include data collected by the form, email processing, retention, user rights/contact route, intellectual property, third-party preview links, upcoming-release status, and the Bengaluru address. Include a visible “review with legal counsel before launch” note in the internal content metadata, not in the polished public copy.

- [ ] **Step 7: Run route tests**

Run: `npm test -- --run src/pages src/app`
Expected: PASS.

- [ ] **Step 8: Commit**

Run: `git add src/app src/pages src/content src/styles && git commit -m "feat: add Haltris public pages and legal content"`

---

### Task 5: Implement and test the contact endpoint

**Files:**
- Create: `server/contact.ts`
- Create: `server/contact.test.ts`
- Modify: `server/index.ts`
- Modify: `src/pages/ContactPage.tsx`
- Create: `src/components/ContactForm.tsx`

**Interfaces:**
- `contactSchema` validates `{ name, email, inquiryType, message, url?, consent }`.
- `getRecipient(inquiryType)` returns one of `support@haltris.com`, `Collaboration@haltris.com`, or `Artist@haltris.com`.
- `sendContactMessage(input, transporter)` returns `{ ok: true }` or a typed error.

- [ ] **Step 1: Write failing server tests**

Test valid support/collaboration/artist routing, invalid email rejection, message length limits, consent requirement, and a transport failure returning a 500-safe error without leaking credentials.

- [ ] **Step 2: Implement Zod validation and recipient routing**

Reject missing/invalid fields, strip unexpected fields, cap name at 120 characters, message at 5000, and URL at 500. Reject any inquiry type outside `support | collaboration | artist`.

- [ ] **Step 3: Implement SMTP transport**

Create a Nodemailer transporter from `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASSWORD`. Use `CONTACT_FROM` as the sender and the selected recipient as the destination. Use the user email only as `replyTo`.

- [ ] **Step 4: Wire Express route**

Mount `POST /api/contact`, return `400` for validation failures, `200` with `{ ok: true }` on success, and `500` with `{ ok: false, message: 'Unable to send your message right now.' }` on transport failures. Never return raw Nodemailer errors.

- [ ] **Step 5: Implement the client form**

Use controlled fields, `aria-describedby` error text, native email validation, disabled submitting state, success/error feedback, and a no-JavaScript fallback with the three mailto links. Do not include file inputs.

- [ ] **Step 6: Run server and UI tests**

Run: `npm test -- --run server/contact.test.ts src/components/ContactForm.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

Run: `git add server src/components/ContactForm.tsx src/pages/ContactPage.tsx && git commit -m "feat: add routed contact form"`

---

### Task 6: Verify production build, Hostinger instructions, and responsive quality

**Files:**
- Create: `README.md`
- Create: `docs/hostinger-deployment.md`
- Create: `src/app/metadata.ts`
- Modify: `index.html`
- Modify: `vite.config.ts`

- [ ] **Step 1: Add metadata and static deployment settings**

Set document title, description, theme color, viewport, and canonical-friendly route behavior. Configure Vite asset paths for root hosting. Add a Hostinger guide with Node version 20+, build command `npm run build`, start command `npm start`, port handling, environment variables, and SMTP setup.

- [ ] **Step 2: Run all tests**

Run: `npm test -- --run`
Expected: all tests pass.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: TypeScript and Vite complete successfully and create `dist/` plus `dist-server/`.

- [ ] **Step 4: Start the production server and smoke-test routes**

Run: `npm start` with a temporary `PORT=4173`, then request `/`, `/artists`, `/artists/lil-sukku`, `/releases`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, and `/release-disclaimer` with `curl`. Expected: each returns HTTP 200 and the app shell.

- [ ] **Step 5: Check responsive and reduced-motion behavior**

Use the browser QA workflow to check narrow mobile width, desktop width, keyboard navigation, no horizontal overflow, no autoplay audio, visible focus, and the WebGL/reduced-motion fallback.

- [ ] **Step 6: Commit**

Run: `git add README.md docs/hostinger-deployment.md src/app/metadata.ts index.html vite.config.ts && git commit -m "docs: add production and Hostinger deployment guide"`
