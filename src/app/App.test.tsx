import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { App } from './App';
import { siteMetadata } from './metadata';

function AppWithNavigation() {
  const navigate = useNavigate();

  return (
    <>
      <button type="button" onClick={() => navigate('/contact')}>Go to contact</button>
      <App />
    </>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

it('renders the Haltris shell', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(within(screen.getByRole('banner')).getByText('HALTRIS')).toBeInTheDocument();
  expect(within(screen.getByRole('navigation', { name: /primary/i })).getByRole('link', { name: /artists/i })).toBeInTheDocument();
});

it('applies route-specific search and social metadata as navigation changes', async () => {
  render(
    <MemoryRouter initialEntries={['/artists']}>
      <AppWithNavigation />
    </MemoryRouter>,
  );

  expect(document.title).toBe('Artists | Haltris Music');
  expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
    'content',
    'The artists on the Haltris roster and the records we are making with them.',
  );
  expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', siteMetadata.themeColor);
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://music.haltris.com/artists');
  expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Artists | Haltris Music');
  expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://music.haltris.com/artists');
  expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute('content', 'Artists | Haltris Music');

  fireEvent.click(screen.getByRole('button', { name: /go to contact/i }));

  await waitFor(() => {
    expect(document.title).toBe('Contact | Haltris Music');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://music.haltris.com/contact');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://music.haltris.com/contact');
  });
});

it('uses typed artist content for direct artist route metadata', () => {
  render(
    <MemoryRouter initialEntries={['/artists/lil-sukku']}>
      <App />
    </MemoryRouter>,
  );

  expect(document.title).toBe("Lil' Sukku | Haltris Music");
  expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'profile');
  expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
    'content',
    expect.stringMatching(/writes it, sings it, and produces it herself/i),
  );
});

it('resets scroll and moves focus to page content when the route changes', async () => {
  const scrollTo = vi.mocked(window.scrollTo);

  render(
    <MemoryRouter initialEntries={['/']}>
      <AppWithNavigation />
    </MemoryRouter>,
  );

  scrollTo.mockClear();
  fireEvent.click(screen.getByRole('button', { name: /go to contact/i }));

  await waitFor(() => {
    expect(document.activeElement).toHaveAttribute('id', 'page-content');
  });
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  expect(screen.getByRole('main')).toBeInTheDocument();
});

it('offers a skip link to the page content as the first focusable element', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  const skip = screen.getByRole('link', { name: /skip to content/i });
  expect(skip).toHaveAttribute('href', '#page-content');
  expect(document.querySelector('a, button')).toBe(skip);
});

it('does not steal focus or scroll on the first page load', () => {
  const scrollTo = vi.mocked(window.scrollTo);
  scrollTo.mockClear();

  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>,
  );

  expect(scrollTo).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(document.body);
});

it('adds structured data on the home and artist pages, and noindex only on missing pages', async () => {
  const { unmount } = render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
  const homeData = JSON.parse(document.head.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(homeData['@type']).toBe('Organization');
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://music.haltris.com/og-image.jpg');
  unmount();

  const artist = render(
    <MemoryRouter initialEntries={['/artists/lil-sukku']}>
      <App />
    </MemoryRouter>,
  );
  const artistData = JSON.parse(document.head.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(artistData).toMatchObject({ '@type': 'MusicGroup', name: "Lil' Sukku" });
  expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
  artist.unmount();

  render(
    <MemoryRouter initialEntries={['/artists/nobody']}>
      <App />
    </MemoryRouter>,
  );
  expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
});
