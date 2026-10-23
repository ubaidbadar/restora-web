import type PhotoSizes from '../types/photo_sizes';

interface PhotoProps {
  /** The large photo (1200px). */
  src: string;
  sizes?: PhotoSizes;
  /** How wide it shows, for the browser to pick a file (`sizes` of the img), e.g. "56px". */
  shownAt: string;
  alt?: string;
  className?: string;
}

/**
 * A dish or deal photo that loads fast: the browser picks the smallest saved size for how wide it shows and the
 * screen's density, a blurred preview fills its place until it arrives, and it waits until it is scrolled to.
 * Photos saved before sizes existed show as they are.
 */
export default function Photo({ src, sizes, shownAt, alt = '', className = '' }: PhotoProps) {
  return (
    <img
      src={sizes?.md ?? src}
      srcSet={sizes ? `${sizes.sm} 160w, ${sizes.md} 480w, ${src} 1200w` : undefined}
      sizes={sizes ? shownAt : undefined}
      width={sizes?.width}
      height={sizes?.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={sizes ? { backgroundImage: `url(${sizes.blur})`, backgroundSize: 'cover' } : undefined}
      className={`object-cover ${className}`}
    />
  );
}
