import { useState, type FormEvent, type InvalidEvent } from 'react';

const fallbackEmails = [
  'support@haltris.com',
  'Collaboration@haltris.com',
  'Artist@haltris.com',
];

type FieldName = 'name' | 'email' | 'inquiryType' | 'message' | 'url' | 'consent';
interface FormValues {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  url: string;
  consent: boolean;
}
type FieldErrors = Partial<Record<FieldName, string>>;

const initialValues: FormValues = {
  name: '',
  email: '',
  inquiryType: 'support',
  message: '',
  url: '',
  consent: false,
};

const invalidMessages: Record<FieldName, string> = {
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  inquiryType: 'Choose an enquiry type.',
  message: 'Enter a message.',
  url: 'Enter a valid URL.',
  consent: 'Consent is required before sending your enquiry.',
};
const GENERIC_ERROR_MESSAGE = 'Unable to send your message right now.';

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [requestError, setRequestError] = useState('');

  function errorId(field: FieldName) {
    return `contact-${field}-error`;
  }

  function describedBy(field: FieldName) {
    const ids = [field === 'consent' ? 'consent-copy' : undefined, errors[field] ? errorId(field) : undefined]
      .filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  }

  function updateField<K extends FieldName>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInvalid(event: InvalidEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const field = event.currentTarget.name as FieldName;
    setErrors((current) => ({ ...current, [field]: invalidMessages[field] }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStatus('submitting');
    setRequestError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          url: values.url || undefined,
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isSuccessfulResponse(payload)) {
        throw new Error(GENERIC_ERROR_MESSAGE);
      }

      setValues(initialValues);
      setErrors({});
      setStatus('success');
    } catch {
      setRequestError(GENERIC_ERROR_MESSAGE);
      setStatus('error');
    }
  }

  return (
    <>
      <form className="contact-form" onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
        <div className="form-grid">
          <label>
            Name
            <input name="name" type="text" autoComplete="name" required maxLength={120}
              value={values.name} onChange={(event) => updateField('name', event.target.value)}
              onInvalid={handleInvalid} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} />
            {errors.name && <span id={errorId('name')} role="alert">{errors.name}</span>}
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required
              value={values.email} onChange={(event) => updateField('email', event.target.value)}
              onInvalid={handleInvalid} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} />
            {errors.email && <span id={errorId('email')} role="alert">{errors.email}</span>}
          </label>
        </div>
        <label>
          Inquiry type
          <select name="inquiryType" value={values.inquiryType}
            onChange={(event) => updateField('inquiryType', event.target.value)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.inquiryType)} aria-describedby={describedBy('inquiryType')}>
            <option value="support">Support</option>
            <option value="collaboration">Collaboration</option>
            <option value="artist">Artist submissions</option>
          </select>
          {errors.inquiryType && <span id={errorId('inquiryType')} role="alert">{errors.inquiryType}</span>}
        </label>
        <label>
          Message
          <textarea name="message" rows={7} required maxLength={5000} value={values.message}
            onChange={(event) => updateField('message', event.target.value)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('message')} />
          {errors.message && <span id={errorId('message')} role="alert">{errors.message}</span>}
        </label>
        <label>
          Optional URL
          <input name="url" type="url" inputMode="url" placeholder="https://" maxLength={500} value={values.url}
            onChange={(event) => updateField('url', event.target.value)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.url)} aria-describedby={describedBy('url')} />
          {errors.url && <span id={errorId('url')} role="alert">{errors.url}</span>}
        </label>
        <label className="checkbox-label" htmlFor="consent">
          <input id="consent" name="consent" type="checkbox" required checked={values.consent}
            onChange={(event) => updateField('consent', event.target.checked)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.consent)} aria-describedby={describedBy('consent')} />
          <span id="consent-copy">I consent to Haltris using my details to review and respond to this enquiry.</span>
          {errors.consent && <span id={errorId('consent')} role="alert">{errors.consent}</span>}
        </label>
        <button className="button-link button-link--solid" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending enquiry…' : 'Send enquiry'} <span aria-hidden="true">↗</span>
        </button>
        {status === 'success' && <p role="status">Thank you. Your enquiry is on its way.</p>}
        {status === 'error' && <p role="alert">{requestError}</p>}
      </form>
      <noscript>
        <p>JavaScript is unavailable. Please email <a href={`mailto:${fallbackEmails[0]}`}>{fallbackEmails[0]}</a>, <a href={`mailto:${fallbackEmails[1]}`}>{fallbackEmails[1]}</a>, or <a href={`mailto:${fallbackEmails[2]}`}>{fallbackEmails[2]}</a>.</p>
      </noscript>
    </>
  );
}

function isSuccessfulResponse(payload: unknown): payload is { ok: true } {
  return typeof payload === 'object' && payload !== null && 'ok' in payload && payload.ok === true;
}
