/**
 * The Haltris mark: eight blocks that stack into an H. The blocks are the
 * visual system of the whole site, so the mark can assemble itself, idle like
 * an equalizer, or sit still.
 */
export const markBlocks = [
  { x: 12, y: 12, width: 10, height: 18 },
  { x: 12, y: 33, width: 10, height: 12 },
  { x: 12, y: 48, width: 10, height: 4 },
  { x: 25, y: 28, width: 15, height: 9 },
  { x: 25, y: 40, width: 8, height: 12 },
  { x: 42, y: 12, width: 10, height: 5 },
  { x: 42, y: 20, width: 10, height: 11 },
  { x: 42, y: 34, width: 10, height: 18 },
] as const;

interface BlockMarkProps {
  /** assemble: blocks drop into place, then idle. still: no motion. */
  motion?: 'assemble' | 'still';
  className?: string;
  /** Decorative by default. Pass a label when the mark carries meaning. */
  label?: string;
}

export function BlockMark({ motion = 'still', className = '', label }: BlockMarkProps) {
  return (
    <svg
      className={`block-mark block-mark--${motion} ${className}`.trim()}
      viewBox="10 10 44 44"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {markBlocks.map((block) => (
        <rect key={`${block.x}-${block.y}`} className="block-mark__block" rx="1.4" {...block} />
      ))}
    </svg>
  );
}
