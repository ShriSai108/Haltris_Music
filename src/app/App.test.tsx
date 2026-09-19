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

  expect(screen.getByText('HALTRIS')).toBeInTheDocument();
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
    'Meet the distinct voices shaping Haltris Music and explore each artist world.',
  );
  expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', siteMetadata.themeColor);
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://haltris.com/artists');
  expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Artists | Haltris Music');
  expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://haltris.com/artists');
  expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute('content', 'Artists | Haltris Music');

  fireEvent.click(screen.getByRole('button', { name: /go to contact/i }));

  await waitFor(() => {
    expect(document.title).toBe('Contact | Haltris Music');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://haltris.com/contact');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://haltris.com/contact');
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
    expect.stringMatching(/restless, late-night music/i),
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
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  expect(screen.getByRole('main')).toBeInTheDocument();
});
