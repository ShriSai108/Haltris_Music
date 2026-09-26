import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Hero } from './Hero';

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero
        eyebrow="Independent music label · Bengaluru"
        title="Records, built *block by block.*"
        description="Haltris is a small label with a slow method."
        primaryAction={{ label: 'Press play', href: 'https://example.com/preview' }}
        secondaryAction={{ label: 'How we work', to: '/about' }}
        aside="Preview · debut single"
      />
    </MemoryRouter>,
  );
}

describe('Hero', () => {
  it('renders the headline as real, readable text with the accent words intact', () => {
    renderHero();

    expect(screen.getByRole('heading', { level: 1, name: 'Records, built block by block.' })).toBeInTheDocument();
    expect(document.querySelectorAll('.kinetic__word')).toHaveLength(5);
    expect(document.querySelectorAll('.kinetic .accent-serif')).toHaveLength(3);
  });

  it('plays the preview directly and links to the method', () => {
    renderHero();

    const listen = screen.getByRole('link', { name: /press play/i });
    expect(listen).toHaveAttribute('href', 'https://example.com/preview');
    expect(listen).toHaveAttribute('target', '_blank');
    expect(listen).toHaveAttribute('rel', 'noopener noreferrer');
    expect(listen).toHaveAccessibleName(/opens in a new tab/i);
    expect(screen.getByRole('link', { name: /how we work/i })).toHaveAttribute('href', '/about');
  });

  it('holds no artist photography, and its artwork is hidden from assistive tech', () => {
    const { container } = renderHero();

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.hero__art')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.hero__mark rect')).toHaveLength(8);
  });
});
