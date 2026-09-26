import { useEffect, useState, type FormEvent, type InvalidEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inquiryTypes, isInquiryType, site, type InquiryType } from '../content/site';

const fallbackEmails = site.emails.map((email) => email.address);

type FieldName = 'name' | 'email' | 'inquiryType' | 'message' | 'url' | 'consent';
interface FormValues {
  name: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
  url: string;
  consent: boolean;
  /** Honeypot: hidden from people, filled in only by bots. */
  company: string;
}
type FieldErrors = Partial<Record<FieldName, string>>;

function initialValuesFor(inquiryType: InquiryType): FormValues {
  return {
    name: '',
    email: '',
    inquiryType,
    message: '',
    url: '',
    consent: false,
    company: '',
  };
}

const invalidMessages: Record<FieldName, string> = {
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  inquiryType: 'Choose an enquiry type.',
  message: 'Enter a message.',
  url: 'Enter a valid URL.',
  consent: 'Consent is required before sending your enquiry.',
};
const MESSAGE_LIMIT = 5000;
const GENERIC_ERROR_MESSAGE = 'Unable to send your message right now.';

export function ContactForm() {
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get('type');
  // Pages are prerendered without a query string, so links like
  // /contact?type=artist choose the enquiry type once the page is live.
  const [values, setValues] = useState<FormValues>(() => initialValuesFor('general'));

  useEffect(() => {
    if (isInquiryType(requestedType)) {
      setValues((current) => ({ ...current, inquiryType: requestedType }));
    }
  }, [requestedType]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const selectedType = inquiryTypes.find((type) => type.value === values.inquiryType) ?? inquiryTypes[0];
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

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
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

      setValues(initialValuesFor(values.inquiryType));
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
        <fieldset className="choice-group" aria-describedby={describedBy('inquiryType')}>
          <legend>What is this about?</legend>
          <div className="choice-group__options">
            {inquiryTypes.map((type) => (
              <label className="choice" key={type.value}>
                <input type="radio" name="inquiryType" value={type.value} required
                  checked={values.inquiryType === type.value}
                  onChange={() => updateField('inquiryType', type.value)} onInvalid={handleInvalid} />
                <span className="choice__card">
                  <span className="choice__title">{type.label}</span>
                  <span className="choice__hint">{type.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.inquiryType && <span id={errorId('inquiryType')} role="alert">{errors.inquiryType}</span>}
        </fieldset>
        <label>
          Message
          <textarea name="message" rows={7} required maxLength={MESSAGE_LIMIT} value={values.message}
            placeholder={selectedType.placeholder}
            onChange={(event) => updateField('message', event.target.value)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('message')} />
          <span className="field-meta" aria-hidden="true">{values.message.length} / {MESSAGE_LIMIT}</span>
          {errors.message && <span id={errorId('message')} role="alert">{errors.message}</span>}
        </label>
        <label>
          <span className="field-label">
            {values.inquiryType === 'artist' ? 'Link to the song' : 'Link to your project'} <span className="optional">optional</span>
          </span>
          <input name="url" type="url" inputMode="url" placeholder="https://" maxLength={500} value={values.url}
            onChange={(event) => updateField('url', event.target.value)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.url)} aria-describedby={describedBy('url')} />
          {errors.url && <span id={errorId('url')} role="alert">{errors.url}</span>}
        </label>
        <div className="form-trap" aria-hidden="true">
          <label>
            Company
            <input name="company" type="text" tabIndex={-1} autoComplete="off" value={values.company}
              onChange={(event) => updateField('company', event.target.value)} />
          </label>
        </div>
        <label className="checkbox-label" htmlFor="consent">
          <input id="consent" name="consent" type="checkbox" required checked={values.consent}
            onChange={(event) => updateField('consent', event.target.checked)} onInvalid={handleInvalid}
            aria-invalid={Boolean(errors.consent)} aria-describedby={describedBy('consent')} />
          <span id="consent-copy">I consent to Haltris using my details to review and respond to this enquiry.</span>
          {errors.consent && <span id={errorId('consent')} role="alert">{errors.consent}</span>}
        </label>
        <div className="contact-form__submit">
          <button className="button button--primary button--lg" type="submit" disabled={status === 'submitting'} data-magnetic>
            <span>{status === 'submitting' ? 'Sending message…' : 'Send message'}</span>
            <span className={status === 'submitting' ? 'button__spinner' : 'button__arrow'} aria-hidden="true">{status === 'submitting' ? '' : '→'}</span>
          </button>
          <p className="contact-form__route">Goes to <strong>{selectedType.address}</strong></p>
        </div>
        {status === 'success' && (
          <p role="status" className="form-status form-status--success">
            <strong>Received. Thanks. Your message has been sent.</strong> A real person reads every one of these, and we will reply from {selectedType.address}.
          </p>
        )}
        {status === 'error' && <p role="alert" className="form-status form-status--error">We could not send your message. Try again, or email <a href={`mailto:${selectedType.address}`}>{selectedType.address}</a> directly.</p>}
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
