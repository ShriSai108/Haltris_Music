import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';

it('renders accessible internal navigation with the current route identified', () => {
  render(
    <MemoryRouter initialEntries={['/artists']}>
      <SiteHeader />
    </MemoryRouter>,
  );

  expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /artists/i })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
});

it('does not mark the root link current on nested routes', () => {
  render(
    <MemoryRouter initialEntries={['/artists']}>
      <SiteHeader />
    </MemoryRouter>,
  );

  expect(screen.getByRole('link', { name: /haltris home/i })).not.toHaveAttribute('aria-current', 'page');
});

it('closes the mobile menu after a navigation link is activated', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <SiteHeader />
    </MemoryRouter>,
  );

  const menuButton = screen.getByRole('button', { name: /menu/i });
  fireEvent.click(menuButton);
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(screen.getByRole('link', { name: /artists/i }));

  expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('link', { name: /artists/i })).toHaveAttribute('aria-current', 'page');
});
