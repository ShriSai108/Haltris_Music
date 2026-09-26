import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotifyForm } from './NotifyForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'fan@example.com' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Tell me' }));
}

describe('release alert form', () => {
  it('sends the email, release, and consent, then confirms', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<NotifyForm release="Lil' Sukku, Debut single" />);

    fillAndSubmit();

    expect(await screen.findByRole('status')).toHaveTextContent('You are on the list.');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/notify');
    expect(JSON.parse(String(init.body))).toMatchObject({ email: 'fan@example.com', release: "Lil' Sukku, Debut single", consent: true });
  });

  it('offers a direct email when the signup fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false }) }));
    render(<NotifyForm release="Debut single" />);

    fillAndSubmit();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('support@haltris.com'));
  });
});
