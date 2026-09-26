import type { Express } from 'express';
import nodemailer, { type Transporter } from 'nodemailer';
import { z } from 'zod';

const inquiryTypes = ['general', 'collaboration', 'artist'] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  inquiryType: z.enum(inquiryTypes),
  message: z.string().trim().min(1, 'Enter a message.').max(5000),
  url: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().url('Enter a valid URL.').max(500).optional(),
  ),
  consent: z.literal(true, { error: 'Consent is required.' }),
  // Honeypot. People never see this field; anything in it means a bot.
  company: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactTransport = Pick<Transporter, 'sendMail'>;

type SmtpEnvironment = {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  CONTACT_FROM?: string;
};

type SendContactResult = { ok: true } | { ok: false; error: 'transport' };

const retryMessage = 'Please wait a moment and try again.';
export const unavailableMessage = 'The form is resting for a moment. Email us directly instead.';
const defaultRateLimitWindowMs = 10 * 60 * 1000;
const defaultRateLimitMaxRequests = 5;
const defaultMaxConcurrentDeliveries = 2;
const defaultMaxTrackedClients = 10_000;

const recipients: Record<ContactInput['inquiryType'], string> = {
  general: 'support@haltris.com',
  collaboration: 'collaboration@haltris.com',
  artist: 'artist@haltris.com',
};

const requiredMailSettings = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'CONTACT_FROM'] as const;

/** Names of mail settings that are missing, so a misconfigured deploy fails loudly at startup. */
export function missingMailSettings(environment: SmtpEnvironment = process.env): string[] {
  return requiredMailSettings.filter((key) => !environment[key]?.trim());
}

export function getRecipient(inquiryType: ContactInput['inquiryType']) {
  return recipients[inquiryType];
}

export function createSmtpTransport(environment: SmtpEnvironment = process.env): ContactTransport {
  const configuredPort = Number(environment.SMTP_PORT);

  return nodemailer.createTransport({
    host: environment.SMTP_HOST,
    port: Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 587,
    secure: environment.SMTP_SECURE?.toLowerCase() === 'true',
    auth: {
      user: environment.SMTP_USER,
      pass: environment.SMTP_PASSWORD,
    },
  });
}

export async function sendContactMessage(
  input: ContactInput,
  transporter: ContactTransport,
  from: string,
): Promise<SendContactResult> {
  try {
    await transporter.sendMail({
      from,
      to: getRecipient(input.inquiryType),
      replyTo: input.email,
      subject: `Haltris ${input.inquiryType} enquiry from ${input.name}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Inquiry type: ${input.inquiryType}`,
        input.url ? `URL: ${input.url}` : undefined,
        '',
        input.message,
      ].filter(Boolean).join('\n'),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'transport' };
  }
}

export interface ContactAbuseProtectionOptions {
  windowMs?: number;
  maxRequests?: number;
  maxConcurrentDeliveries?: number;
  maxTrackedClients?: number;
  now?: () => number;
}

export interface ContactRouteOptions {
  transporter?: ContactTransport;
  environment?: SmtpEnvironment;
  from?: string;
  abuseProtection?: ContactAbuseProtectionOptions;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function positiveDuration(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createAbuseProtection(options: ContactAbuseProtectionOptions = {}) {
  const windowMs = positiveDuration(options.windowMs, defaultRateLimitWindowMs);
  const maxRequests = positiveInteger(options.maxRequests, defaultRateLimitMaxRequests);
  const maxConcurrentDeliveries = positiveInteger(options.maxConcurrentDeliveries, defaultMaxConcurrentDeliveries);
  const maxTrackedClients = positiveInteger(options.maxTrackedClients, defaultMaxTrackedClients);
  const now = options.now ?? Date.now;
  const requestsByIp = new Map<string, number[]>();
  let concurrentDeliveries = 0;

  return {
    acceptRequest(clientIp: string) {
      const timestamp = now();
      const earliestTimestamp = timestamp - windowMs;

      for (const [ip, timestamps] of requestsByIp) {
        const activeTimestamps = timestamps.filter((requestTimestamp) => requestTimestamp > earliestTimestamp);
        if (activeTimestamps.length === 0) {
          requestsByIp.delete(ip);
        } else if (activeTimestamps.length !== timestamps.length) {
          requestsByIp.set(ip, activeTimestamps);
        }
      }

      if (!requestsByIp.has(clientIp) && requestsByIp.size >= maxTrackedClients) {
        let oldestIp: string | undefined;
        let oldestTimestamp = Number.POSITIVE_INFINITY;

        for (const [ip, timestamps] of requestsByIp) {
          const lastRequest = timestamps[timestamps.length - 1] ?? Number.POSITIVE_INFINITY;
          if (lastRequest < oldestTimestamp) {
            oldestIp = ip;
            oldestTimestamp = lastRequest;
          }
        }

        if (oldestIp) requestsByIp.delete(oldestIp);
      }

      const recentRequests = requestsByIp.get(clientIp) ?? [];
      if (recentRequests.length >= maxRequests) {
        requestsByIp.set(clientIp, recentRequests);
        return false;
      }

      recentRequests.push(timestamp);
      requestsByIp.set(clientIp, recentRequests);
      return true;
    },
    startDelivery() {
      if (concurrentDeliveries >= maxConcurrentDeliveries) {
        return false;
      }

      concurrentDeliveries += 1;
      return true;
    },
    finishDelivery() {
      concurrentDeliveries -= 1;
    },
  };
}

export function registerContactRoute(app: Express, options: ContactRouteOptions = {}) {
  const environment = options.environment ?? process.env;
  const transporter = options.transporter ?? createSmtpTransport(environment);
  const from = options.from ?? environment.CONTACT_FROM ?? '';
  const abuseProtection = createAbuseProtection(options.abuseProtection);
  // An injected transporter (tests) counts as configured.
  const mailReady = options.transporter !== undefined || missingMailSettings(environment).length === 0;

  app.post('/api/contact', async (request, response) => {
    if (!abuseProtection.acceptRequest(request.ip ?? request.socket.remoteAddress ?? 'unknown')) {
      response.status(429).json({ ok: false, message: retryMessage });
      return;
    }

    const result = contactSchema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({ ok: false, message: 'Please check the form and try again.' });
      return;
    }

    // Answer a filled honeypot as if it worked, so bots learn nothing, but send nothing.
    if (result.data.company?.trim()) {
      response.status(200).json({ ok: true });
      return;
    }

    // Without mail settings the site still runs; only the form pauses.
    if (!mailReady) {
      response.status(503).json({ ok: false, message: unavailableMessage });
      return;
    }

    if (!abuseProtection.startDelivery()) {
      response.status(429).json({ ok: false, message: retryMessage });
      return;
    }

    let delivery: SendContactResult;
    try {
      delivery = await sendContactMessage(result.data, transporter, from);
    } finally {
      abuseProtection.finishDelivery();
    }

    if (!delivery.ok) {
      response.status(500).json({ ok: false, message: 'Unable to send your message right now.' });
      return;
    }

    response.status(200).json({ ok: true });
  });
}
