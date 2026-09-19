import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

it('renders the Haltris shell', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText('HALTRIS')).toBeInTheDocument();
  expect(within(screen.getByRole('navigation', { name: /primary/i })).getByRole('link', { name: /artists/i })).toBeInTheDocument();
});
