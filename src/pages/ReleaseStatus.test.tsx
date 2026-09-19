import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

describe('release status rendering', () => {
  it('renders the status from release data on home, releases, and artist routes', async () => {
    vi.resetModules();
    vi.doMock('../content/releases', () => ({
      releases: [
        {
          slug: 'lil-sukku-debut-preview',
          title: "Lil' Sukku — Debut Preview",
          artistSlug: 'lil-sukku',
          status: 'released',
          previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
          description: 'A first signal from Lil\' Sukku.',
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

      expect(screen.getByText('released')).toBeInTheDocument();
      unmount();
    }
  });
});
