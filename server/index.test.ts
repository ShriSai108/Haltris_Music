// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContactTransport } from './contact';
import { createApp } from './index';

const temporaryDirectories: string[] = [];

const pageRoutes = [
  '/',
  '/artists',
  '/artists/lil-sukku',
  '/releases',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/release-disclaimer',
];

function pageHtml(title: string) {
  return `<!doctype html><title>${title}</title><div id="root"><main>${title} content</main></div>`;
}

/** A client directory shaped like the real build output. */
async function createClientDirectory() {
  const clientDirectory = await mkdtemp(path.join(tmpdir(), 'haltris-client-'));
  temporaryDirectories.push(clientDirectory);

  for (const route of pageRoutes) {
    const file = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html');
    await mkdir(path.dirname(path.join(clientDirectory, file)), { recursive: true });
    await writeFile(path.join(clientDirectory, file), pageHtml(`Page ${route}`));
  }

  await writeFile(path.join(clientDirectory, '404.html'), pageHtml('Page not found'));
  await writeFile(path.join(clientDirectory, 'og-image.jpg'), 'image');
  await mkdir(path.join(clientDirectory, 'assets'));
  await writeFile(path.join(clientDirectory, 'assets', 'index-abc123.js'), 'console.log(1)');
  return clientDirectory;
}

async function withServer(run: (baseUrl: string) => Promise<void>, transporter?: ContactTransport) {
  const clientDirectory = await createClientDirectory();
  const app = createApp({
    clientDirectory,
    contact: transporter ? { transporter, from: 'mail@haltris.com' } : undefined,
  });
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });
  const address = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('prerendered page serving', () => {
  it.each(pageRoutes)('serves the prerendered page for %s', async (route) => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}${route}`);

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-cache');
      await expect(response.text()).resolves.toContain(`Page ${route} content`);
    });
  });

  it('does not serve files outside the site through encoded path tricks', async () => {
    await withServer(async (baseUrl) => {
      for (const route of ['/..%2f..%2fpackage.json', '/artists/..%2f..%2f..%2fetc%2fpasswd', '/%2e%2e/%2e%2e/etc/passwd']) {
        const response = await fetch(`${baseUrl}${route}`);
        const body = await response.text();

        expect(response.status).toBe(404);
        expect(body).not.toMatch(/root:|"name"|ENOENT|\/var\/|\/Users\//);
      }
    });
  });

  it.each(['/artists/nobody', '/future-client-route'])('returns a real 404 with the not-found page for %s', async (route) => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}${route}`);

      expect(response.status).toBe(404);
      await expect(response.text()).resolves.toContain('Page not found');
    });
  });

  it.each([
    ['/artists/', '/artists'],
    ['/artists/lil-sukku/', '/artists/lil-sukku'],
    ['/contact/?type=artist', '/contact?type=artist'],
  ])('redirects %s to its single address %s', async (route, target) => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });

      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe(target);
    });
  });

  it.each(['/missing-image.png', '/assets/missing-script.js', '/api/unknown'])('returns a plain 404 for missing file or API route %s', async (route) => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}${route}`);

      const body = await response.text();
      expect(response.status).toBe(404);
      expect(body).not.toContain('<html');
      expect(body).not.toMatch(/ENOENT|\/var\/|\/Users\//);
    });
  });
});

describe('caching and security headers', () => {
  it('caches hashed build assets for a year', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/assets/index-abc123.js`);

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    });
  });

  it('caches other public files for a day', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/og-image.jpg`);

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('public, max-age=86400');
    });
  });

  it('sends security headers and does not advertise the framework', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);

      expect(response.headers.get('x-powered-by')).toBeNull();
      expect(response.headers.get('content-security-policy')).toContain("default-src 'self'");
      expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
      expect(response.headers.get('strict-transport-security')).toContain('max-age=31536000');
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    });
  });
});

describe('contact endpoint wiring', () => {
  const validBody = {
    name: 'Asha Rao',
    email: 'asha@example.com',
    inquiryType: 'artist',
    message: 'Here is my demo.',
    consent: true,
  };

  it('delivers a real enquiry to the matching inbox', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'sent' });

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...validBody, company: '' }),
      });

      expect(response.status).toBe(200);
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'artist@haltris.com', replyTo: 'asha@example.com' }));
    }, { sendMail } as unknown as ContactTransport);
  });

  it('answers a filled honeypot as success without sending mail', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'sent' });

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...validBody, company: 'Spam Inc' }),
      });

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ ok: true });
      expect(sendMail).not.toHaveBeenCalled();
    }, { sendMail } as unknown as ContactTransport);
  });

  it('rejects oversized request bodies', async () => {
    const sendMail = vi.fn();

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...validBody, message: 'x'.repeat(50_000) }),
      });

      expect(response.status).toBe(413);
      expect(sendMail).not.toHaveBeenCalled();
    }, { sendMail } as unknown as ContactTransport);
  });
});
