import type { ResponsiveImage as ResponsiveImageData } from '../content/artists';
import { BlockMark } from './BlockMark';
import { ResponsiveImage } from './ResponsiveImage';

interface RecordSleeveProps {
  image: ResponsiveImageData;
  sizes: string;
  priority?: boolean;
  /** Small caption on the sleeve's corner, like a catalogue number. */
  catalogue?: string;
}

/**
 * The artist photo as a record sleeve, with a vinyl disc that slides out and
 * spins when the section comes into view or is hovered. Purely decorative
 * apart from the photo itself, which keeps its alt text.
 */
export function RecordSleeve({ image, sizes, priority = false, catalogue }: RecordSleeveProps) {
  return (
    <div className="sleeve">
      <div className="sleeve__disc" aria-hidden="true">
        <span className="sleeve__grooves" />
        <span className="sleeve__label">
          <BlockMark className="sleeve__mark" />
        </span>
      </div>
      <div className="sleeve__cover">
        <ResponsiveImage image={image} sizes={sizes} priority={priority} />
        {catalogue ? <span className="sleeve__catalogue" aria-hidden="true">{catalogue}</span> : null}
      </div>
    </div>
  );
}
