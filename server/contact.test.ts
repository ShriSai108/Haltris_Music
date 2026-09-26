// @vitest-environment node

import express from 'express';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contactSchema,
  createSmtpTransport,
  getRecipient,
  registerContactRoute,
  sendContactMessage,
  type ContactInput,
  type ContactTransport,
} from './contact';

const validInput: ContactInput = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  inquiryType: 'general',
  message: 'I would like help with a release preview.',
  consent: true,
};

function createTransport(sendMail = vi.fn().mockResolvedValue({ messageId: 'sent' })) {
  return { sendMail } as unknown as ContactTransport;
}

async function withContactServer(
  transporter: ContactTransport,
  run: (baseUrl: string) => Promise<void>,
  options: Parameters<typeof registerContactRoute>[1] = {},
) {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());
  registerContactRoute(app, { ...options, transporter, from: 'mail@haltris.com' });

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('contact validation and delivery', () => {
  it.each([
    ['general', 'support@haltris.com'],
    ['collaboration', 'collaboration@haltris.com'],
    ['artist', 'artist@haltris.com'],
  ] as const)('routes %s enquiries to %s', async (inquiryType, recipient) => {
    const transporter = createTransport();
    const input = { ...validInput, inquiryType };

    expect(getRecipient(inquiryType)).toBe(recipient);
    await expect(sendContactMessage(input, transporter, 'mail@haltris.com')).resolves.toEqual({ ok: true });
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'mail@haltris.com',
      replyTo: input.email,
      to: recipient,
    }));
  });

  it('rejects invalid input, oversized messages, absent consent, and unknown fields', () => {
    expect(contactSchema.safeParse({ ...validInput, email: 'not-an-email' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validInput, name: 'a'.repeat(121) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validInput, message: 'a'.repeat(5001) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validInput, url: 'https://haltris.com/' + 'a'.repeat(500) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validInput, consent: false }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validInput, inquiryType: 'press' }).success).toBe(false);

    const parsed = contactSchema.parse({ ...validInput, unexpected: 'discard me' });
    expect(parsed).not.toHaveProperty('unexpected');
  });

  it('creates its SMTP transport from the configured environment', () => {
    const transport = createSmtpTransport({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '2525',
      SMTP_SECURE: 'true',
      SMTP_USER: 'mailer',
      SMTP_PASSWORD: 'test-password',
      CONTACT_FROM: 'mail@haltris.com',
    }) as unknown as { options: Record<string, unknown> };

    expect(transport.options).toMatchObject({
      host: 'smtp.example.com',
      port: 2525,
      secure: true,
      auth: { user: 'mailer', pass: 'test-password' },
    });
  });

  it('returns a safe 500 response when SMTP delivery fails', async () => {
    const transporter = createTransport(vi.fn().mockRejectedValue(new Error('SMTP_PASSWORD=private-secret')));

    await withContactServer(transporter, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validInput),
      });

      expect(response.status).toBe(500);
      const body = await response.text();
      expect(JSON.parse(body)).toEqual({
        ok: false,
        message: 'Unable to send your message right now.',
      });
      expect(body).not.toContain('private-secret');
    });
  });

  it('accepts valid requests and returns 400 for invalid payloads', async () => {
    const transporter = createTransport();

    await withContactServer(transporter, async (baseUrl) => {
      const invalidResponse = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...validInput, consent: false }),
      });
      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({ ok: false, message: 'Please check the form and try again.' });

      const successResponse = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validInput),
      });
      expect(successResponse.status).toBe(200);
      await expect(successResponse.json()).resolves.toEqual({ ok: true });
    });
  });

  it('throttles repeated requests from one forwarded client without calling SMTP', async () => {
    const transporter = createTransport();
    let now = 1_000;

    await withContactServer(transporter, async (baseUrl) => {
      const send = () => fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.42',
        },
        body: JSON.stringify(validInput),
      });

      expect((await send()).status).toBe(200);
      const throttled = await send();

      expect(throttled.status).toBe(429);
      await expect(throttled.json()).resolves.toEqual({
        ok: false,
        message: 'Please wait a moment and try again.',
      });
      expect(transporter.sendMail).toHaveBeenCalledTimes(1);

      now += 1_001;
      expect((await send()).status).toBe(200);
    }, {
      abuseProtection: { maxRequests: 1, windowMs: 1_000, now: () => now },
    });
  });

  it('bounds tracked client state while allowing new clients through', async () => {
    const transporter = createTransport();

    await withContactServer(transporter, async (baseUrl) => {
      const send = (ip: string) => fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(validInput),
      });

      expect((await send('203.0.113.10')).status).toBe(200);
      expect((await send('203.0.113.11')).status).toBe(200);
      expect((await send('203.0.113.10')).status).toBe(200);
    }, {
      abuseProtection: { maxRequests: 1, maxTrackedClients: 1 },
    });
  });

  it('rejects excess concurrent deliveries without calling SMTP', async () => {
    let releaseFirstDelivery: (() => void) | undefined;
    const transporter = createTransport(vi.fn(() => new Promise((resolve) => {
      releaseFirstDelivery = () => resolve({ messageId: 'sent' });
    })));

    await withContactServer(transporter, async (baseUrl) => {
      const firstRequest = fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validInput),
      });

      await vi.waitFor(() => expect(transporter.sendMail).toHaveBeenCalledTimes(1));

      const secondResponse = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...validInput, email: 'second@example.com' }),
      });

      expect(secondResponse.status).toBe(429);
      await expect(secondResponse.json()).resolves.toEqual({
        ok: false,
        message: 'Please wait a moment and try again.',
      });
      expect(transporter.sendMail).toHaveBeenCalledTimes(1);

      releaseFirstDelivery?.();
      expect((await firstRequest).status).toBe(200);
    }, {
      abuseProtection: { maxRequests: 10, windowMs: 60_000, maxConcurrentDeliveries: 1 },
    });
  });
});

describe('mail settings check', () => {
  it('names every missing required setting', async () => {
    const { missingMailSettings } = await import('./contact');

    expect(missingMailSettings({})).toEqual(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'CONTACT_FROM']);
    expect(missingMailSettings({ SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASSWORD: ' ', CONTACT_FROM: 'f' })).toEqual(['SMTP_PASSWORD']);
    expect(missingMailSettings({ SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASSWORD: 'p', CONTACT_FROM: 'f' })).toEqual([]);
  });
});
