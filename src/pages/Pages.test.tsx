import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../app/App';

const PREVIEW_URL = 'https://toolost.com/release-preview/MTcyMTY0Mw';

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function hasPreviewLink() {
  return screen
    .getAllByRole('link', { name: /preview/i })
    .some((link) => link.getAttribute('href') === PREVIEW_URL);
}

describe('public route content', () => {
  it('renders the home page with an honest headline and a direct way to listen', () => {
    renderRoute('/');

    expect(screen.getByRole('heading', { level: 1, name: 'Records, built block by block.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /how we work/i })).toHaveAttribute('href', '/about');
    // The hero plays the music directly instead of sending people to another page first.
    expect(screen.getByRole('link', { name: /press play/i })).toHaveAttribute('href', PREVIEW_URL);
    expect(hasPreviewLink()).toBe(true);
  });

  it('tells the first artist and first record once on the home page', () => {
    renderRoute('/');

    expect(screen.getAllByRole('heading', { name: /lil' sukku/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('img', { name: /lil' sukku/i })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /read her profile/i })).toHaveAttribute('href', '/artists/lil-sukku');
  });

  it('points every demo call to action at the artist enquiry type', () => {
    renderRoute('/');

    for (const link of screen.getAllByRole('link', { name: /send a demo/i })) {
      expect(link).toHaveAttribute('href', '/contact?type=artist');
    }
  });

  it('opens external listening links safely in a new tab and says so', () => {
    renderRoute('/releases');

    const link = screen.getByRole('link', { name: /listen to the preview/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName(/opens in a new tab/i);
  });

  it('does not claim a catalogue before the first release is out', () => {
    renderRoute('/releases');

    expect(screen.queryByText(/everything we put out, newest first/i)).not.toBeInTheDocument();
    expect(screen.getByText(/one record so far/i)).toBeInTheDocument();
  });

  it('offers a release alert signup and a press kit', () => {
    renderRoute('/releases');
    expect(screen.getByRole('button', { name: 'Tell me' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeRequired();
  });

  it('lets press download the logo and photo from the about page', () => {
    renderRoute('/about');
    expect(screen.getByRole('link', { name: /haltris mark, light/i })).toHaveAttribute('href', '/press/haltris-mark-light.svg');
    expect(screen.getByRole('link', { name: /press photo/i })).toHaveAttribute('download');
  });

  it.each([
    ['/artists', /the artists\./i],
    ['/releases', /the discography starts here/i],
    ['/about', /a label that works like a studio/i],
    ['/contact', /say hello\. or send a song\./i],
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

    expect(screen.getByRole('heading', { level: 1, name: /^lil' sukku$/i })).toBeInTheDocument();
    const photo = screen.getByRole('img', { name: /lil' sukku photographed in motion/i });
    expect(photo).toHaveAttribute('src', expect.stringMatching(/\.webp$/));
    expect(photo).toHaveAttribute('srcset');
    expect(photo).toHaveAttribute('width', '1254');
    expect(photo).toHaveAttribute('height', '1254');
    expect(screen.getByText(/writes it, sings it, and produces it herself/i)).toBeInTheDocument();
    expect(screen.getByRole('figure')).toHaveTextContent(/i would rather release one song i mean/i);
    expect(hasPreviewLink()).toBe(true);
  });

  it('renders contact routing and the required consent language', () => {
    renderRoute('/contact');

    expect(screen.getByRole('heading', { level: 1, name: /say hello/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /what is this about/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/consent/i)).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByRole('link', { name: /support@haltris.com/i })).toHaveAttribute(
      'href',
      'mailto:support@haltris.com',
    );
  });

  it('marks the release as upcoming on the releases page', () => {
    renderRoute('/releases');

    const previewLink = screen.getByRole('link', { name: /preview/i });
    expect(previewLink).toHaveAttribute('href', PREVIEW_URL);
    expect(within(previewLink.closest('li') as HTMLElement).getByText(/upcoming/i)).toBeInTheDocument();
  });

  it('renders the catch-all not-found page', () => {
    renderRoute('/not-a-real-page');

    expect(screen.getByRole('heading', { name: /could not find that page/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the home page/i })).toHaveAttribute('href', '/');
  });
});
