import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerContactRoute } from './contact.js';
import { renderRouteShell } from './page-metadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT ?? 3000);
const defaultClientDirectory = path.resolve(__dirname, '../dist');

function isClientRoute(requestPath: string) {
  const isApiRoute = requestPath === '/api' || requestPath.startsWith('/api/');
  const isAssetRoute = requestPath === '/assets' || requestPath.startsWith('/assets/');
  const hasFileExtension = path.posix.extname(requestPath) !== '';
  return !isApiRoute && !isAssetRoute && !hasFileExtension;
}

export function createApp({ clientDirectory = defaultClientDirectory }: { clientDirectory?: string } = {}) {
  const app = express();

  // Hostinger fronts the Node process with one reverse proxy, so use its client IP
  // for contact throttling without trusting arbitrary multi-hop forwarding headers.
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  registerContactRoute(app);
  app.use(express.static(clientDirectory, { redirect: false }));
  app.get('/*splat', (request, response, next) => {
    if (!isClientRoute(request.path)) {
      next();
      return;
    }

    readFile(path.join(clientDirectory, 'index.html'), 'utf8')
      .then((html) => {
        response.set('Cache-Control', 'no-cache');
        response.type('html').send(renderRouteShell(html, request.path));
      })
      .catch(next);
  });

  return app;
}

const app = createApp();

if (process.env.VITEST === undefined) {
  app.listen(port, () => {
    console.log(`Haltris server listening on port ${port}`);
  });
}

export { app };
