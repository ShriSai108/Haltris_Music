# Hosting on a Hostinger WordPress (or shared) plan

These plans run PHP, not Node.js. The site doesn't need Node on the server: every page is already built to plain HTML. Two small PHP scripts handle the contact form and the release alert form, and an `.htaccess` file takes care of clean addresses, the 404 page, HTTPS, caching, compression and security headers.

WordPress itself is not used. The plan only provides the hosting.

## 1. Build the upload (on your computer)

```bash
npm ci
npm run build:hostinger
```

This creates two things:

- `release/haltris-hostinger.zip`: everything that goes **inside** `public_html`.
- `release/hostinger/haltris-config.sample.php`: the mail settings file, which goes **one folder above** `public_html`.

## 2. Clear out WordPress (only if it is installed)

If WordPress is installed on haltris.com, its files are in `public_html` and would be mixed in with the site.

1. In hPanel → **Files → Backups**, download a backup of the files and the database first.
2. In hPanel → **Files → File Manager**, open `domains/haltris.com/public_html` and delete everything in it: `wp-admin`, `wp-content`, `wp-includes`, `index.php`, `wp-*.php`, `xmlrpc.php`, `license.txt`, `readme.html` and `.htaccess`. Turn on "Show hidden files" so `.htaccess` shows up.

Leaving the WordPress files there is not safe. The login page (`wp-login.php`) and old plugins would stay reachable even though the site doesn't use them.

## 3. Upload the site

1. In File Manager, open `public_html` and upload `haltris-hostinger.zip`.
2. Right click it and choose **Extract**, into `public_html` itself (not a new subfolder).
3. Delete the zip.

Check that `public_html` now holds `index.html`, `.htaccess`, `api/`, `assets/` and the page folders (`about/`, `artists/` and so on).

## 4. Set up the form email

1. In hPanel → **Emails**, make sure `support@`, `collaboration@` and `artist@haltris.com` exist, since the forms deliver to them. Create `website@haltris.com` as the mailbox the site sends from.
2. Rename `haltris-config.sample.php` to `haltris-config.php` and fill in the password of `website@haltris.com`.
3. Upload it to `domains/haltris.com/`, the folder that **contains** `public_html`. Never put it inside `public_html`.

The defaults are already right for Hostinger email: `smtp.hostinger.com`, port 465, `ssl`. Until this file is in place, the site works normally and both forms ask visitors to email the label directly.

## 5. Hosting settings in hPanel

- **SSL:** Security → SSL → install the free certificate for haltris.com. The `.htaccess` sends every visitor to `https://haltris.com`, so do this first.
- **PHP version:** Advanced → PHP Configuration → PHP 8.1 or newer (8.3 recommended).
- **Cache:** if Hostinger's cache or CDN is on, purge it after every upload.

## 6. Check it

- `/`, `/artists`, `/artists/lil-sukku`, `/releases`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies` and `/release-disclaimer` all load.
- `/about/` jumps to `/about`, `www.haltris.com` jumps to `haltris.com`, and `http://` jumps to `https://`.
- `/artists/nobody` shows the "page not found" page.
- `https://haltris.com/api/health` shows `{"ok":true}`. Point an uptime monitor here.
- Send one message from `/contact` and one release alert from `/releases`. Both should arrive.
- `https://haltris.com/api/_lib.php` and `https://haltris.com/.htaccess` are refused (403).

## Updating the site later

Edit the content, run `npm run build:hostinger` again, then upload and extract the new zip over the old files. Deleting `public_html/assets` first is optional: old files there are harmless, but it keeps things tidy. `haltris-config.php` sits outside `public_html`, so updates never touch it.

## What the files do

| File | Job |
| --- | --- |
| `hosting/public_html/.htaccess` | HTTPS and www redirects, clean addresses, 404 page, security headers, caching, compression, blocks private files |
| `hosting/public_html/assets/.htaccess` | Lets browsers keep the hashed build files for a year |
| `hosting/public_html/api/contact.php`, `notify.php` | The two forms. Same checks, limits (5 sends per visitor per 10 minutes) and messages as the Node server |
| `hosting/public_html/api/health.php` | Uptime check |
| `hosting/haltris-config.sample.php` | Mail settings template |

`npm test` runs the PHP form handlers against a fake mail server whenever PHP is installed on the computer (`brew install php` on a Mac). Otherwise those tests are skipped.
