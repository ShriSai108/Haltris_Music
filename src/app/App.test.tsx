import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { siteMetadata } from './metadata';

it('renders the Haltris shell', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText('HALTRIS')).toBeInTheDocument();
  expect(within(screen.getByRole('navigation', { name: /primary/i })).getByRole('link', { name: /artists/i })).toBeInTheDocument();
});

it('applies site metadata to the document at runtime', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(document.title).toBe(siteMetadata.title);
  expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', siteMetadata.description);
  expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', siteMetadata.themeColor);
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new URL(siteMetadata.canonicalPath, window.location.origin).href,
  );
});
