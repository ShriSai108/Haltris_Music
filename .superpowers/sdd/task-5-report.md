# Task 5 Report: Routed Contact Form

## Status

Implemented and committed the SMTP-backed contact endpoint and accessible React form. The required focused tests, full test suite, and production build passed.

## Changed Files

- `server/contact.ts` — Zod input schema, recipient routing, SMTP transport construction from environment variables, safe delivery result, and Express route registration.
- `server/contact.test.ts` — validation, three recipient routes, SMTP environment mapping, safe transport failure, and real Express route tests.
- `server/index.ts` — mounts URL-encoded parsing and the contact route in place of the previous `501` placeholder.
- `src/components/ContactForm.tsx` — controlled contact form, native validation/error associations, async submission state, safe success/error feedback, and mailto fallback markup.
- `src/components/ContactForm.test.tsx` — field/accessibility, fallback markup, submitting/success, and delivery-error tests.
- `src/pages/ContactPage.tsx` — integrates `ContactForm` while preserving existing routing links and address content.

## Commit

- `437769b feat: add routed contact form`

## Verification

### Test-first baseline

Command:

```sh
npm test -- --run server/contact.test.ts src/components/ContactForm.test.tsx
```

Initial output before implementation:

```text
Failed Suites 2
Cannot find module './contact'
Failed to resolve import "./ContactForm"
```

### Focused tests

Command:

```sh
npm test -- --run server/contact.test.ts src/components/ContactForm.test.tsx
```

Output:

```text
Test Files  2 passed (2)
Tests  11 passed (11)
Duration  901ms
```

### Full suite

Command:

```sh
npm test -- --run
```

Output:

```text
Test Files  10 passed (10)
Tests  47 passed (47)
Duration  3.73s
```

### Production build

Command:

```sh
npm run build
```

Output:

```text
vite v8.3.0 building client environment for production...
transforming...
✓ 48 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.39 kB │ gzip:   0.26 kB
dist/assets/index-BBrBFV_z.css   12.12 kB │ gzip:   3.27 kB
dist/assets/index-D63sJAzB.js   818.15 kB │ gzip: 222.63 kB
✓ built in 232ms
```

The build also emitted Vite's existing large-chunk warning for the 818.15 kB client bundle. This task does not alter bundle splitting.

## Review Notes

The scoped review found no server-side credential disclosure, request-routing, validation, or API response-contract defect. The transport failure path returns only the required generic message.

## Concerns

The component includes `<noscript>` mailto fallback markup. The deployed no-JavaScript fallback is provided by the static content in `index.html`, as completed in Task 6; React is not required to mount `ContactPage` for that fallback to be available.

## Task 5 Review Fix: Generic Client Errors

### Findings addressed

- Normalized rejected `fetch` promises, malformed `response.json()` results, non-OK responses, unsuccessful payloads, and unexpected client errors to the fixed message `Unable to send your message right now.`.
- Removed the path that displayed raw caught exception text.
- Added a focused regression test covering both a rejected fetch and malformed JSON, including assertions that the raw error text is not rendered.

### Test-first regression

Command:

```sh
npm test -- --run src/components/ContactForm.test.tsx
```

Output before the production fix:

```text
Test Files  1 failed (1)
Tests  1 failed | 4 passed (5)
Error: expect(element).toHaveTextContent()
Expected element to have text content:
  Unable to send your message right now.
Received:
  network details should not be shown
```

### Focused verification

Command:

```sh
npm test -- --run src/components/ContactForm.test.tsx
```

Output:

```text
Test Files  1 passed (1)
Tests  5 passed (5)
```

### Full test suite

Command:

```sh
npm test -- --run
```

Output:

```text
Test Files  10 passed (10)
Tests  49 passed (49)
```

### Production build

Command:

```sh
npm run build
```

Output:

```text
vite v8.3.0 building client environment for production...
transforming...
✓ 48 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.39 kB │ gzip:   0.26 kB
dist/assets/index-BBrBFV_z.css   12.12 kB │ gzip:   3.27 kB
dist/assets/index-uMWFaka8.js   817.97 kB │ gzip: 222.61 kB
✓ built in 458ms
```

The build also emitted Vite's existing warning that a minified chunk exceeds 500 kB; no bundle-splitting changes were made.
