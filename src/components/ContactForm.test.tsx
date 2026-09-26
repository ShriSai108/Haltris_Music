import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from './ContactForm';

function Form({ path = '/contact' }: { path?: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <ContactForm />
    </MemoryRouter>
  );
}

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
    render(<Form />);

    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email');
    expect(screen.queryByLabelText(/file/i)).not.toBeInTheDocument();
    const staticMarkup = renderToStaticMarkup(<Form />);
    expect(staticMarkup).toContain('mailto:support@haltris.com');
    expect(staticMarkup).toContain('mailto:collaboration@haltris.com');
    expect(staticMarkup).toContain('mailto:artist@haltris.com');
  });

  it('associates native validation errors with their fields', () => {
    render(<Form />);

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
    render(<Form />);
    fillValidForm();

    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!);

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));

    resolveRequest(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    expect(await screen.findByRole('status')).toHaveTextContent(/thanks\. your message has been sent/i);
  });

  it('shows a safe error when the request cannot be delivered', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      message: 'Unable to send your message right now.',
    }), { status: 500 })));
    render(<Form />);
    fillValidForm();

    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('We could not send your message. Try again, or email support@haltris.com directly.');
    });
  });

  it('shows the generic error when fetch rejects or response JSON is malformed', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('network details should not be shown'))
      .mockResolvedValueOnce(new Response('{malformed-json', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Form />);
    fillValidForm();

    const form = screen.getByRole('button', { name: /send message/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('We could not send your message. Try again, or email support@haltris.com directly.');
      expect(screen.getByRole('alert')).not.toHaveTextContent('network details should not be shown');
    });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('We could not send your message. Try again, or email support@haltris.com directly.');
      expect(screen.getByRole('alert')).not.toHaveTextContent('Unexpected end of JSON input');
    });
  });

  it('starts on General and offers the three enquiry types', () => {
    render(<Form />);

    const radios = screen.getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual(['general', 'collaboration', 'artist']);
    expect(screen.getByRole('radio', { name: /general/i })).toBeChecked();
    expect(screen.getByRole('group', { name: /what is this about/i })).toBeInTheDocument();
  });

  it.each([
    ['/contact?type=artist', 'artist'],
    ['/contact?type=collaboration', 'collaboration'],
    ['/contact?type=nonsense', 'general'],
  ])('preselects the enquiry type from %s', async (path, expected) => {
    render(<Form path={path} />);

    await waitFor(() => expect(screen.getByRole('radio', { checked: true })).toHaveAttribute('value', expected));
  });

  it('sends the honeypot field empty for people and keeps it out of reach', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<Form path="/contact?type=artist" />);
    const trap = container.querySelector('input[name="company"]')!;

    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();

    await waitFor(() => expect(screen.getByRole('radio', { name: /demos/i })).toBeChecked());
    fillValidForm();
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!);

    await screen.findByRole('status');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ inquiryType: 'artist', company: '' });
  });

  it('tells people where the message goes and adapts the prompts to the enquiry type', () => {
    render(<Form />);

    expect(screen.getByText('support@haltris.com', { selector: 'strong' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /demos/i }));

    expect(screen.getByText('artist@haltris.com', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByLabelText(/link to the song/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toHaveAttribute('placeholder', expect.stringMatching(/will not leave you alone/i));
  });
});
