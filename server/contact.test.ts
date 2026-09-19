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
  inquiryType: 'support',
  message: 'I would like help with a release preview.',
  consent: true,
};

function createTransport(sendMail = vi.fn().mockResolvedValue({ messageId: 'sent' })) {
  return { sendMail } as unknown as ContactTransport;
}

async function withContactServer(
  transporter: ContactTransport,
  run: (baseUrl: string) => Promise<void>,
) {
  const app = express();
  app.use(express.json());
  registerContactRoute(app, { transporter, from: 'mail@haltris.com' });

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
    ['support', 'support@haltris.com'],
    ['collaboration', 'Collaboration@haltris.com'],
    ['artist', 'Artist@haltris.com'],
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
});
