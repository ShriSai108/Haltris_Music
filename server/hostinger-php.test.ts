// @vitest-environment node

// The PHP form handlers used on Hostinger (hosting/public_html/api), run with
// `php -S` against a fake SMTP server. Skipped where PHP is not installed.

import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import net, { type AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const hasPhp = spawnSync('php', ['-v']).status === 0;
const apiSource = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../hosting/public_html/api');

interface CapturedMail { from: string; to: string; auth: string[]; data: string }

/** Speaks just enough SMTP to accept one message per connection. */
function startFakeSmtp(mails: CapturedMail[]) {
  const server = net.createServer((socket) => {
    const mail: CapturedMail = { from: '', to: '', auth: [], data: '' };
    let buffer = '';
    let mode: 'command' | 'data' | 'auth' = 'command';
    socket.write('220 fake ESMTP\r\n');
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      let index: number;
      while ((index = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (mode === 'data') {
          if (line === '.') { mode = 'command'; mails.push(mail); socket.write('250 queued\r\n'); } else mail.data += `${line}\n`;
        } else if (mode === 'auth') {
          mail.auth.push(Buffer.from(line, 'base64').toString());
          socket.write(mail.auth.length === 1 ? '334 UGFzc3dvcmQ6\r\n' : '235 ok\r\n');
          if (mail.auth.length === 2) mode = 'command';
        } else if (line.startsWith('EHLO')) socket.write('250-fake\r\n250 AUTH LOGIN\r\n');
        else if (line === 'AUTH LOGIN') { mode = 'auth'; socket.write('334 VXNlcm5hbWU6\r\n'); }
        else if (line.startsWith('MAIL FROM:')) { mail.from = line.slice(10); socket.write('250 ok\r\n'); }
        else if (line.startsWith('RCPT TO:')) { mail.to = line.slice(8); socket.write('250 ok\r\n'); }
        else if (line === 'DATA') { mode = 'data'; socket.write('354 go\r\n'); }
        else if (line === 'QUIT') { socket.end('221 bye\r\n'); }
        else socket.write('500 what\r\n');
      }
    });
  });
  return new Promise<net.Server>((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function decodedBody(mail: CapturedMail) {
  const [, body = ''] = mail.data.split('\n\n');
  return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
}

function headerValue(mail: CapturedMail, name: string) {
  return mail.data.split('\n\n')[0].split('\n').find((line) => line.startsWith(`${name}: `))?.slice(name.length + 2);
}

describe.skipIf(!hasPhp)('PHP form handlers for Hostinger', () => {
  const mails: CapturedMail[] = [];
  let directory = '';
  let smtp: net.Server;
  let php: ChildProcess;
  let baseUrl = '';

  async function writeConfig(content: string | undefined) {
    const file = path.join(directory, 'haltris-config.php');
    if (content === undefined) await rm(file, { force: true });
    else await writeFile(file, content);
  }

  const workingConfig = () => `<?php return ['from' => 'support@haltris.com', 'from_name' => 'Haltris Music website',
    'smtp' => ['host' => '127.0.0.1', 'port' => ${(smtp.address() as AddressInfo).port}, 'secure' => 'none',
    'user' => 'support@haltris.com', 'password' => 'secret']];`;

  const post = (endpoint: string, body: unknown) => fetch(`${baseUrl}/api/${endpoint}.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  const contact = {
    name: 'Asha Rao', email: 'asha@example.com', inquiryType: 'artist',
    message: 'Here is my demo.', url: 'https://example.com/demo', consent: true, company: '',
  };

  beforeAll(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'haltris-php-'));
    await cp(apiSource, path.join(directory, 'public_html', 'api'), { recursive: true });
    smtp = await startFakeSmtp(mails);

    const port = await new Promise<number>((resolve) => {
      const probe = net.createServer().listen(0, '127.0.0.1', () => {
        const { port: free } = probe.address() as AddressInfo;
        probe.close(() => resolve(free));
      });
    });
    php = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', path.join(directory, 'public_html')], { stdio: 'ignore' });
    baseUrl = `http://127.0.0.1:${port}`;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (await fetch(`${baseUrl}/api/health.php`).then(() => true, () => false)) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  beforeEach(async () => {
    mails.length = 0;
    await rm(path.join(directory, '.form-limits'), { recursive: true, force: true });
    await writeConfig(workingConfig());
  });

  afterAll(async () => {
    php?.kill();
    await new Promise((resolve) => smtp?.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });

  it('answers the health check without caching', async () => {
    const response = await fetch(`${baseUrl}/api/health.php`);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('delivers an enquiry to the matching inbox, logged in, with a reply-to', async () => {
    const response = await post('contact', contact);

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe('<artist@haltris.com>');
    expect(mails[0].from).toBe('<support@haltris.com>');
    expect(mails[0].auth).toEqual(['support@haltris.com', 'secret']);
    expect(headerValue(mails[0], 'Reply-To')).toBe('asha@example.com');
    expect(headerValue(mails[0], 'Subject')).toBe('Haltris artist enquiry from Asha Rao');
    expect(decodedBody(mails[0])).toContain('URL: https://example.com/demo');
    expect(decodedBody(mails[0])).toContain('Here is my demo.');
  });

  it('keeps line breaks in a name from adding email headers', async () => {
    await post('contact', { ...contact, name: 'Asha\r\nBcc: victim@example.com' });

    expect(mails).toHaveLength(1);
    expect(mails[0].data).not.toMatch(/^Bcc:/m);
    expect(headerValue(mails[0], 'Subject')).toBe('Haltris artist enquiry from Asha Bcc: victim@example.com');
  });

  it('rejects invalid forms and non-JSON bodies', async () => {
    for (const body of [
      { ...contact, email: 'not-an-email' },
      { ...contact, inquiryType: 'sales' },
      { ...contact, consent: false },
      { ...contact, url: 'javascript:alert(1)' },
      { ...contact, message: 'x'.repeat(5001) },
      'not json',
    ]) {
      await rm(path.join(directory, '.form-limits'), { recursive: true, force: true });
      const response = await post('contact', body);
      expect(response.status).toBe(400);
    }
    expect(mails).toHaveLength(0);
  });

  it('only accepts POST and small bodies', async () => {
    expect((await fetch(`${baseUrl}/api/contact.php`)).status).toBe(405);
    expect((await post('contact', { ...contact, message: 'x'.repeat(30_000) })).status).toBe(413);
  });

  it('thanks a filled honeypot without sending anything', async () => {
    const response = await post('contact', { ...contact, company: 'Spam Inc' });
    expect(response.status).toBe(200);
    expect(mails).toHaveLength(0);
  });

  it('pauses politely when mail is not set up yet', async () => {
    await writeConfig(undefined);
    const response = await post('contact', contact);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ message: 'The form is resting for a moment. Email us directly instead.' });

    await writeConfig(`<?php return ['from' => 'support@haltris.com', 'smtp' => ['host' => 'smtp.hostinger.com', 'user' => 'support@haltris.com', 'password' => '']];`);
    expect((await post('notify', { email: 'fan@example.com', consent: true })).status).toBe(503);
  });

  it('reports a mail server failure as an error', async () => {
    await writeConfig(workingConfig().replace(/'port' => \d+/, "'port' => 1"));
    const response = await post('contact', contact);
    expect(response.status).toBe(500);
  });

  it('limits each visitor to five sends per ten minutes', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) statuses.push((await post('contact', contact)).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it('emails release alert signups to the label inbox', async () => {
    const response = await post('notify', { email: 'fan@example.com', release: 'Debut single', consent: true, company: '' });

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mails[0].to).toBe('<support@haltris.com>');
    expect(headerValue(mails[0], 'Reply-To')).toBe('fan@example.com');
    expect(decodedBody(mails[0])).toContain('Release: Debut single');
    expect((await post('notify', { email: 'fan@example.com' })).status).toBe(400);
  });
});
