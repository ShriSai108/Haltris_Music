import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

it('renders the Haltris shell', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText('HALTRIS')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /artists/i })).toBeInTheDocument();
});
