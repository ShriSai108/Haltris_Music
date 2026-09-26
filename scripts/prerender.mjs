// Writes a fully rendered HTML file for every route, plus the 404 page,
// sitemap.xml, and robots.txt. Runs after the client and server bundles build.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const template = await readFile(path.join(clientDir, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html is not the build template. Run "npm run build" rather than this step on its own.');
}

const { render, prerenderRoutes, NOT_FOUND_PATH, renderSitemap, renderRobots } = await import(
  pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
);

// Preload the self-hosted font so text does not reflow when it arrives.
const assets = await readdir(path.join(clientDir, 'assets'));
// Both faces appear above the fold: Inter for the text, the serif for headline accents.
const fontPreload = assets
  .filter((file) => /^(Inter-latin-var|InstrumentSerif-Italic-latin)-.*\.woff2$/.test(file))
  .map((file) => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />\n    `)
  .join('');

function page(pathname) {
  const { html, head } = render(pathname);
  return template
    .replace('<!--app-head-->', `${fontPreload}${head}`)
    .replace('<!--app-html-->', html);
}

function outputFileFor(route) {
  return route === '/' ? path.join(clientDir, 'index.html') : path.join(clientDir, route.slice(1), 'index.html');
}

for (const route of prerenderRoutes) {
  const file = outputFileFor(route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, page(route));
}

await writeFile(path.join(clientDir, '404.html'), page(NOT_FOUND_PATH));
await writeFile(path.join(clientDir, 'sitemap.xml'), renderSitemap(new Date().toISOString().slice(0, 10)));
await writeFile(path.join(clientDir, 'robots.txt'), renderRobots());

// The server bundle was only needed to render; it is not deployed.
await rm(ssrDir, { recursive: true, force: true });

console.log(`Prerendered ${prerenderRoutes.length} routes, 404.html, sitemap.xml, and robots.txt.`);
