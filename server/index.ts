import express, { type NextFunction, type Request, type Response } from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { missingMailSettings, registerContactRoute, type ContactRouteOptions } from './contact.js';
import { registerNotifyRoute } from './notify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultClientDirectory = path.resolve(__dirname, '../dist');

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Security headers for every response. The policy allows only this origin,
 * plus inline JSON-LD (which never executes) and outbound links.
 */
const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

function isPageRoute(requestPath: string) {
  const isApiRoute = requestPath === '/api' || requestPath.startsWith('/api/');
  const isAssetRoute = requestPath === '/assets' || requestPath.startsWith('/assets/');
  const hasFileExtension = path.posix.extname(requestPath) !== '';
  return !isApiRoute && !isAssetRoute && !hasFileExtension;
}

/** Maps a clean URL to its prerendered file, refusing anything that escapes the client directory. */
function prerenderedFileFor(clientDirectory: string, requestPath: string) {
  const relative = requestPath === '/' ? 'index.html' : path.posix.join(requestPath.slice(1), 'index.html');
  const file = path.resolve(clientDirectory, relative);
  return file.startsWith(clientDirectory + path.sep) ? file : undefined;
}

export interface AppOptions {
  clientDirectory?: string;
  contact?: ContactRouteOptions;
}

export function createApp({ clientDirectory = defaultClientDirectory, contact }: AppOptions = {}) {
  const app = express();
  const resolvedClientDirectory = path.resolve(clientDirectory);

  app.disable('x-powered-by');
  // Hostinger fronts the Node process with one reverse proxy, so use its client IP
  // for contact throttling without trusting arbitrary multi-hop forwarding headers.
  app.set('trust proxy', 1);

  app.use((_request, response, next) => {
    response.set(securityHeaders);
    next();
  });

  // One address per page: /artists/ and /artists// redirect to /artists.
  app.use((request, response, next) => {
    if ((request.method === 'GET' || request.method === 'HEAD') && request.path.length > 1 && request.path.endsWith('/')) {
      const query = request.originalUrl.slice(request.path.length);
      const cleanPath = request.path.replace(/\/+$/, '') || '/';
      response.redirect(301, `${cleanPath.replace(/\/{2,}/g, '/')}${query}`);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '20kb' }));
  registerContactRoute(app, contact);
  registerNotifyRoute(app, contact);

  // Hashed build files never change, so browsers may keep them for a year.
  app.use('/assets', express.static(path.join(resolvedClientDirectory, 'assets'), {
    fallthrough: false,
    immutable: true,
    maxAge: ONE_YEAR_SECONDS * 1000,
    redirect: false,
  }));

  // Other public files (images, icons) keep their names, so cache them for a day.
  app.use(express.static(resolvedClientDirectory, {
    index: false,
    redirect: false,
    maxAge: '1d',
    setHeaders(response, filePath) {
      if (filePath.endsWith('.html')) response.set('Cache-Control', 'no-cache');
    },
  }));

  app.get('/{*splat}', (request: Request, response: Response, next: NextFunction) => {
    if (!isPageRoute(request.path)) {
      next();
      return;
    }

    const file = prerenderedFileFor(resolvedClientDirectory, request.path);
    const sendHtml = (status: number, html: string) => {
      response.status(status).set('Cache-Control', 'no-cache').type('html').send(html);
    };

    (file ? readFile(file, 'utf8') : Promise.reject(new Error('outside client directory')))
      .then((html) => sendHtml(200, html))
      .catch(() => readFile(path.join(resolvedClientDirectory, '404.html'), 'utf8')
        .then((html) => sendHtml(404, html)))
      .catch(next);
  });

  // Anything else (missing files, unknown API routes) is a plain 404.
  app.use((_request: Request, response: Response) => {
    response.status(404).type('text').send('Not found');
  });

  // Never show internal details such as file paths or stack traces.
  app.use((error: { status?: number; statusCode?: number }, _request: Request, response: Response, _next: NextFunction) => {
    const status = error.status ?? error.statusCode ?? 500;
    if (status >= 500) console.error(error);
    response.status(status).type('text').send(status === 404 ? 'Not found' : status === 413 ? 'Too large' : 'Something went wrong');
  });

  return app;
}

function start() {
  const missing = missingMailSettings();
  if (missing.length > 0) {
    // The site stays up; the contact and release alert forms answer with a
    // friendly "email us directly" until mail is configured.
    console.warn(
      `Contact email is not configured. Set: ${missing.join(', ')}. See docs/hostinger-deployment.md. `
        + 'The site is running, but the forms will not send mail until then.',
    );
  }

  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => {
    console.log(`Haltris server listening on port ${port}`);
  });
}

if (process.env.VITEST === undefined) {
  start();
}
