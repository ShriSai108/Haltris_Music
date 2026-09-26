import type { Express } from 'express';
import { z } from 'zod';
import {
  createAbuseProtection,
  createSmtpTransport,
  missingMailSettings,
  unavailableMessage,
  type ContactRouteOptions,
} from './contact.js';

/** Where release alert signups land. The label replies from here on release day. */
export const notifyRecipient = 'support@haltris.com';

export const notifySchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254),
  release: z.string().trim().max(120).optional(),
  consent: z.literal(true, { error: 'Consent is required.' }),
  // Honeypot, as on the contact form.
  company: z.string().max(200).optional(),
});

export type NotifyInput = z.infer<typeof notifySchema>;

/**
 * "Tell me when it's out." Each signup is emailed to the label inbox, so the
 * list lives where the team already works and no database is needed.
 */
export function registerNotifyRoute(app: Express, options: ContactRouteOptions = {}) {
  const environment = options.environment ?? process.env;
  const transporter = options.transporter ?? createSmtpTransport(environment);
  const from = options.from ?? environment.CONTACT_FROM ?? '';
  const abuseProtection = createAbuseProtection(options.abuseProtection);
  const mailReady = options.transporter !== undefined || missingMailSettings(environment).length === 0;

  app.post('/api/notify', async (request, response) => {
    if (!abuseProtection.acceptRequest(request.ip ?? request.socket.remoteAddress ?? 'unknown')) {
      response.status(429).json({ ok: false, message: 'Please wait a moment and try again.' });
      return;
    }

    const result = notifySchema.safeParse(request.body);
    if (!result.success) {
      response.status(400).json({ ok: false, message: 'Enter a valid email address.' });
      return;
    }

    if (result.data.company?.trim()) {
      response.status(200).json({ ok: true });
      return;
    }

    if (!mailReady) {
      response.status(503).json({ ok: false, message: unavailableMessage });
      return;
    }

    if (!abuseProtection.startDelivery()) {
      response.status(429).json({ ok: false, message: 'Please wait a moment and try again.' });
      return;
    }

    try {
      await transporter.sendMail({
        from,
        to: notifyRecipient,
        replyTo: result.data.email,
        subject: `Release alert signup: ${result.data.email}`,
        text: [
          `Email: ${result.data.email}`,
          `Release: ${result.data.release ?? 'Any new release'}`,
          'They agreed to one email when this release is out.',
        ].join('\n'),
      });
      response.status(200).json({ ok: true });
    } catch {
      response.status(500).json({ ok: false, message: 'We could not save that right now.' });
    } finally {
      abuseProtection.finishDelivery();
    }
  });
}
