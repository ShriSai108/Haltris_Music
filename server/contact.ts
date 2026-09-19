import type { Express } from 'express';
import nodemailer, { type Transporter } from 'nodemailer';
import { z } from 'zod';

const inquiryTypes = ['support', 'collaboration', 'artist'] as const;

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

const recipients: Record<ContactInput['inquiryType'], string> = {
  support: 'support@haltris.com',
  collaboration: 'Collaboration@haltris.com',
  artist: 'Artist@haltris.com',
};

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

interface ContactRouteOptions {
  transporter?: ContactTransport;
  environment?: SmtpEnvironment;
  from?: string;
}

export function registerContactRoute(app: Express, options: ContactRouteOptions = {}) {
  const environment = options.environment ?? process.env;
  const transporter = options.transporter ?? createSmtpTransport(environment);
  const from = options.from ?? environment.CONTACT_FROM ?? '';

  app.post('/api/contact', async (request, response) => {
    const result = contactSchema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({ ok: false, message: 'Please check the form and try again.' });
      return;
    }

    const delivery = await sendContactMessage(result.data, transporter, from);
    if (!delivery.ok) {
      response.status(500).json({ ok: false, message: 'Unable to send your message right now.' });
      return;
    }

    response.status(200).json({ ok: true });
  });
}
