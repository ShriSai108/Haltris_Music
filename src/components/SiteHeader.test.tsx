import { render, screen } from '@testing-library/react';
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
