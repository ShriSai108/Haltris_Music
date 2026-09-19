import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from './ContactForm';

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Asha Rao' } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'asha@example.com' } });
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'I would like to collaborate.' } });
  fireEvent.click(screen.getByLabelText(/i consent/i));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactForm', () => {
  it('includes text and link-only fields with mailto fallback markup', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email');
    expect(screen.queryByLabelText(/file/i)).not.toBeInTheDocument();
    const staticMarkup = renderToStaticMarkup(<ContactForm />);
    expect(staticMarkup).toContain('mailto:support@haltris.com');
    expect(staticMarkup).toContain('mailto:Collaboration@haltris.com');
    expect(staticMarkup).toContain('mailto:Artist@haltris.com');
  });

  it('associates native validation errors with their fields', () => {
    render(<ContactForm />);

    const email = screen.getByLabelText(/^email$/i);
    fireEvent.invalid(email);

    const error = screen.getByText(/enter a valid email address/i);
    expect(email).toHaveAttribute('aria-describedby', error.id);
  });

  it('submits a valid payload, disables its button, and displays success feedback', async () => {
    let resolveRequest: (value: Response) => void = () => undefined;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole('button', { name: /send enquiry/i }).closest('form')!);

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));

    resolveRequest(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    expect(await screen.findByRole('status')).toHaveTextContent(/thank you/i);
  });

  it('shows a safe error when the request cannot be delivered', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      message: 'Unable to send your message right now.',
    }), { status: 500 })));
    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole('button', { name: /send enquiry/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to send your message right now.');
    });
  });
});
