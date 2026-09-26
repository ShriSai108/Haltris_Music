import type { ResponsiveImage as ResponsiveImageData } from '../content/artists';

interface ResponsiveImageProps {
  image: ResponsiveImageData;
  sizes: string;
  /** The first visible image on a page loads eagerly; everything else lazily. */
  priority?: boolean;
}

export function ResponsiveImage({ image, sizes, priority = false }: ResponsiveImageProps) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  );
}
