import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  it('exposes the first row once to assistive tech and hides the decorative copies', () => {
    const { container } = render(<Marquee rows={[['Songwriting', 'Distribution'], ['No filler']]} label="What the label does" />);

    expect(screen.getByRole('list', { name: /what the label does/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(container.querySelectorAll('.marquee__row')).toHaveLength(2);
  });

  it('lets people pause and resume the moving strips', () => {
    const { container } = render(<Marquee rows={[['Songwriting']]} label="What the label does" />);
    const toggle = screen.getByRole('button', { name: /pause the scrolling list/i });

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /play the scrolling list/i })).toBeInTheDocument();
    expect(container.querySelector('.marquee--paused')).not.toBeNull();
  });
});
