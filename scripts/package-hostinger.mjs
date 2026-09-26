// Builds the upload for PHP hosting (Hostinger WordPress or shared plans):
//   release/hostinger/public_html/   everything that goes inside public_html
//   release/hostinger/haltris-config.sample.php   goes one folder above it
//   release/haltris-hostinger.zip    the same, zipped for hPanel's File Manager
// Run `npm run build` first; `npm run build:hostinger` does both.

import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const hosting = path.join(root, 'hosting');
const release = path.join(root, 'release');
const output = path.join(release, 'hostinger');
const publicHtml = path.join(output, 'public_html');
const zipFile = path.join(release, 'haltris-hostinger.zip');

await stat(path.join(dist, 'index.html')).catch(() => {
  throw new Error('dist/ is missing. Run `npm run build` first.');
});

await rm(output, { recursive: true, force: true });
await rm(zipFile, { force: true });
await mkdir(publicHtml, { recursive: true });

// The prerendered site, then the PHP endpoints and server rules on top.
await cp(dist, publicHtml, { recursive: true });
await cp(path.join(hosting, 'public_html'), publicHtml, { recursive: true });
await cp(path.join(hosting, 'haltris-config.sample.php'), path.join(output, 'haltris-config.sample.php'));

// Zip the contents of public_html (including .htaccess files), ready to extract in place.
execFileSync('zip', ['-rqX', zipFile, '.', '-x', '.DS_Store', '*/.DS_Store'], { cwd: publicHtml });

console.log(`Hostinger upload ready: ${path.relative(root, zipFile)} (extract inside public_html)`);
console.log(`Mail settings template: ${path.relative(root, path.join(output, 'haltris-config.sample.php'))} (goes one folder above public_html)`);
