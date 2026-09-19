import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../app/App';

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('public route content', () => {
  it('renders the home page with the hero and preview CTA', () => {
    renderRoute('/');

    expect(screen.getByRole('heading', { name: /sound for the after-hours/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore artists/i })).toHaveAttribute('href', '/artists');
    expect(screen.getByRole('link', { name: /preview/i })).toHaveAttribute(
      'href',
      'https://toolost.com/release-preview/MTcyMTY0Mw',
    );
  });

  it.each([
    ['/artists', /^Artists$/i],
    ['/releases', /^Releases$/i],
    ['/about', /about haltris/i],
    ['/contact', /^Contact$/i],
    ['/privacy', /privacy policy/i],
    ['/terms', /terms of use/i],
    ['/cookies', /cookie policy/i],
    ['/release-disclaimer', /release disclaimer/i],
  ])('renders the route-level content for %s', (path, heading) => {
    renderRoute(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the artist detail page from the artist slug and related release data', () => {
    renderRoute('/artists/lil-sukku');

    expect(screen.getByRole('heading', { name: /^lil' sukku$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/restless, late-night music/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /preview/i })).toHaveAttribute(
      'href',
      'https://toolost.com/release-preview/MTcyMTY0Mw',
    );
  });

  it('renders contact routing and the required consent language', () => {
    renderRoute('/contact');

    expect(screen.getByRole('heading', { name: /^Contact$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/inquiry type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consent/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /support@haltris.com/i })).toHaveAttribute(
      'href',
      'mailto:support@haltris.com',
    );
  });

  it('marks the release preview as upcoming on the releases page', () => {
    renderRoute('/releases');

    const previewLink = screen.getByRole('link', { name: /preview/i });
    expect(previewLink).toHaveAttribute('href', 'https://toolost.com/release-preview/MTcyMTY0Mw');
    expect(within(previewLink.closest('article') as HTMLElement).getByText(/upcoming/i)).toBeInTheDocument();
  });

  it('renders the catch-all not-found page', () => {
    renderRoute('/not-a-real-page');

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
  });
});
