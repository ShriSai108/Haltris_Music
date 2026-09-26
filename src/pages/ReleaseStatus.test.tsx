import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

describe('release status rendering', () => {
  it('renders the status label from release data on home, releases, and artist routes', async () => {
    vi.resetModules();
    vi.doMock('../content/releases', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../content/releases')>()),
      releases: [
        {
          slug: 'lil-sukku-debut-preview',
          title: "Lil' Sukku — debut single",
          artistSlug: 'lil-sukku',
          status: 'upcoming',
          statusLabel: 'Out now',
          format: 'Single',
          releaseDate: '2026-11-06',
          previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
          description: 'The first record from the label.',
        },
      ],
    }));

    const { App } = await import('../app/App');

    for (const path of ['/', '/releases', '/artists/lil-sukku']) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );

      expect(screen.getByText('Out now')).toBeInTheDocument();
      expect(screen.getByText('6 November 2026')).toBeInTheDocument();
      unmount();
    }
  });
});
