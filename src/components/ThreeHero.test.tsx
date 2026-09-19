import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundToggle } from './SoundToggle';
import { ThreeHero } from './ThreeHero';

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('ThreeHero', () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  it('renders its copy and leaves sound disabled on initial render', () => {
    render(
      <ThreeHero
        eyebrow="Haltris Music"
        title="Sound for the after-hours."
        description="Independent music, carefully amplified."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Sound for the after-hours.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable sound/i })).toHaveAttribute('aria-pressed', 'false');
    expect(document.querySelector('audio')).not.toBeInTheDocument();
  });

  it('uses a non-animated fallback when reduced motion is preferred', () => {
    setReducedMotion(true);

    const { container } = render(
      <ThreeHero
        eyebrow="Haltris Music"
        title="Sound for the after-hours."
        description="Independent music, carefully amplified."
      />,
    );

    expect(container.querySelector('.three-hero__scene--fallback')).toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
  });
});

describe('SoundToggle', () => {
  it('only enables sound after a user activation', () => {
    const onEnable = vi.fn();

    render(<SoundToggle enabled={false} onEnable={onEnable} />);

    const button = screen.getByRole('button', { name: /enable sound/i });
    expect(onEnable).not.toHaveBeenCalled();

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onEnable).toHaveBeenCalledOnce();
  });
});
