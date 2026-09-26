// @vitest-environment node

import express from 'express';
import type { AddressInfo } from 'node:net';
import { describe, expect, it, vi } from 'vitest';
import { registerContactRoute, type ContactRouteOptions, type ContactTransport } from './contact';
import { notifyRecipient, registerNotifyRoute } from './notify';

async function withServer(options: ContactRouteOptions, run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  registerContactRoute(app, options);
  registerNotifyRoute(app, options);
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function post(url: string, body: unknown) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

describe('release alerts', () => {
  it('emails the signup to the label inbox', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'sent' });
    const transporter = { sendMail } as unknown as ContactTransport;

    await withServer({ transporter, from: 'mail@haltris.com' }, async (baseUrl) => {
      const response = await post(`${baseUrl}/api/notify`, { email: 'fan@example.com', release: 'Debut single', consent: true });
      expect(response.status).toBe(200);
    });

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: notifyRecipient,
      replyTo: 'fan@example.com',
      subject: 'Release alert signup: fan@example.com',
    }));
  });

  it('rejects an invalid email or missing consent', async () => {
    const sendMail = vi.fn();
    const transporter = { sendMail } as unknown as ContactTransport;

    await withServer({ transporter }, async (baseUrl) => {
      expect((await post(`${baseUrl}/api/notify`, { email: 'nope', consent: true })).status).toBe(400);
      expect((await post(`${baseUrl}/api/notify`, { email: 'fan@example.com' })).status).toBe(400);
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('pretends to accept a filled honeypot without sending', async () => {
    const sendMail = vi.fn();
    const transporter = { sendMail } as unknown as ContactTransport;

    await withServer({ transporter }, async (baseUrl) => {
      const response = await post(`${baseUrl}/api/notify`, { email: 'bot@example.com', consent: true, company: 'Spam Inc' });
      expect(response.status).toBe(200);
    });
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe('without mail settings', () => {
  it('keeps running and answers both forms with a friendly 503', async () => {
    await withServer({ environment: {} }, async (baseUrl) => {
      const notify = await post(`${baseUrl}/api/notify`, { email: 'fan@example.com', consent: true });
      expect(notify.status).toBe(503);
      expect(await notify.json()).toMatchObject({ ok: false });

      const contact = await post(`${baseUrl}/api/contact`, {
        name: 'Asha', email: 'asha@example.com', inquiryType: 'general', message: 'Hello', consent: true,
      });
      expect(contact.status).toBe(503);
    });
  });
});
