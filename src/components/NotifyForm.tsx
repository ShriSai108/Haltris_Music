import { useId, useState, type FormEvent } from 'react';
import { press } from '../content/site';

interface NotifyFormProps {
  /** What the signup is for, sent along so the inbox knows. */
  release: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * "Tell me when it's out." One email field, one promise: a single email on
 * release day. Keeps a visitor who came for the preview from leaving for good.
 */
export function NotifyForm({ release }: NotifyFormProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, release, consent, company }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || typeof payload !== 'object' || payload === null || !('ok' in payload) || payload.ok !== true) {
        throw new Error('notify failed');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className="notify notify--done">
        <strong>You are on the list.</strong> One email when it is out. That is the whole deal.
      </p>
    );
  }

  return (
    <form className="notify" onSubmit={handleSubmit} aria-busy={status === 'submitting'} aria-labelledby={`${id}-title`}>
      <p className="notify__title" id={`${id}-title`}>Hear it first on release day</p>
      <div className="notify__row">
        <label className="sr-only" htmlFor={`${id}-email`}>Email address</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254}
          placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button className="button button--ghost" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Adding you…' : 'Tell me'}
        </button>
      </div>
      <div className="form-trap" aria-hidden="true">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" value={company}
            onChange={(event) => setCompany(event.target.value)} />
        </label>
      </div>
      <label className="notify__consent" htmlFor={`${id}-consent`}>
        <input id={`${id}-consent`} name="consent" type="checkbox" required checked={consent}
          onChange={(event) => setConsent(event.target.checked)} />
        <span>Email me once when it is out. No newsletter, no selling my address.</span>
      </label>
      {status === 'error' && (
        <p role="alert" className="form-status form-status--error">
          That did not go through. Try again, or email <a href={`mailto:${press.contact}`}>{press.contact}</a> and we will add you.
        </p>
      )}
    </form>
  );
}
