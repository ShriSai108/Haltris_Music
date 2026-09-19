// @vitest-environment node

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from './index';

const temporaryDirectories: string[] = [];

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const clientDirectory = await mkdtemp(path.join(tmpdir(), 'haltris-client-'));
  temporaryDirectories.push(clientDirectory);
  await writeFile(path.join(clientDirectory, 'index.html'), `<!doctype html>
<title>Haltris Music</title>
<meta name="description" content="Home description" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Haltris Music" />
<meta property="og:description" content="Home description" />
<meta property="og:url" content="https://haltris.com/" />
<meta name="twitter:title" content="Haltris Music" />
<meta name="twitter:description" content="Home description" />
<link rel="canonical" href="https://haltris.com/" />`);
  await writeFile(path.join(clientDirectory, 'haltris-logo.png'), 'logo');

  const app = createApp({ clientDirectory });
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

describe('production SPA routing', () => {
  it.each([
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
  ])('serves the app shell for valid route %s', async (route) => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}${route}`);

      expect(response.status).toBe(200);
      await expect(response.text()).resolves.toContain('<title>');
    });
  });

  it('renders direct route metadata before client JavaScript runs', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/artists`);
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-cache');
      expect(body).toContain('<title>Artists | Haltris Music</title>');
      expect(body).toContain('content="https://haltris.com/artists"');
      expect(body).toContain('content="Meet the distinct voices shaping Haltris Music and explore each artist world."');
      expect(body).toContain('<link rel="canonical" href="https://haltris.com/artists" />');
    });
  });

  it('renders direct artist metadata for a dynamic client route', async () => {
    await withServer(async (baseUrl) => {
      const body = await (await fetch(`${baseUrl}/artists/lil-sukku`)).text();

      expect(body).toContain("<title>Lil' Sukku | Haltris Music</title>");
      expect(body).toContain('content="profile"');
      expect(body).toContain('content="https://haltris.com/artists/lil-sukku"');
    });
  });

  it('serves existing static assets', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/haltris-logo.png`);

      expect(response.status).toBe(200);
      await expect(response.text()).resolves.toBe('logo');
    });
  });

  it.each(['/artists/future-artist', '/future-client-route', '/artists/lil-sukku/'])('serves the app shell for extensionless client route %s', async (route) => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}${route}`);

      expect(response.status).toBe(200);
      await expect(response.text()).resolves.toContain('<title>');
    });
  });

  it.each(['/missing-image.png', '/assets', '/assets/', '/assets/missing-script.js', '/api/unknown'])('returns 404 for non-client route %s', async (route) => {
    await withServer(async (baseUrl) => {
      expect((await fetch(`${baseUrl}${route}`)).status).toBe(404);
    });
  });
});
