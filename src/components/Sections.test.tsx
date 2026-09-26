import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { artists } from '../content/artists';
import { editorialPillars, manifesto } from '../content/site';
import { KineticText } from './KineticText';
import { Manifesto } from './Manifesto';
import { RecordSleeve } from './RecordSleeve';
import { Tracklist } from './Tracklist';

describe('design components', () => {
  it('keeps kinetic headlines readable as plain text with spaces', () => {
    const { container } = render(<h1><KineticText text="Say hello. *Or send a song.*" /></h1>);

    expect(container.querySelector('h1')).toHaveTextContent('Say hello. Or send a song.');
    expect(screen.getByRole('heading')).toHaveAccessibleName('Say hello. Or send a song.');
  });

  it('writes the method as an ordered tracklist without invented running times', () => {
    render(<Tracklist items={editorialPillars} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(editorialPillars.length);
    expect(screen.getByRole('heading', { name: 'Song first' })).toBeInTheDocument();
    expect(document.querySelector('.tracklist__time')).toBeNull();
  });

  it('renders every manifesto line as a readable sentence', () => {
    const { container } = render(<Manifesto lines={manifesto} />);

    const lines = container.querySelectorAll('.manifesto__line');
    expect(lines).toHaveLength(manifesto.length);
    lines.forEach((line, index) => expect(line.textContent?.trim()).toBe(manifesto[index]));
  });

  it('shows the artist photo on the sleeve and hides the decorative vinyl', () => {
    const { container } = render(<RecordSleeve image={artists[0].image} sizes="100vw" catalogue="Release 01" />);

    expect(screen.getByRole('img', { name: artists[0].image.alt })).toBeInTheDocument();
    expect(container.querySelector('.sleeve__disc')).toHaveAttribute('aria-hidden', 'true');
  });
});
