import { User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** A rounded square for a business (restaurant logo) instead of a person's circle. */
  square?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 20,
  xl: 28,
};

export default function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  square = false,
  className = '',
}: AvatarProps) {
  // Remembering which src failed resets the fallback automatically when src changes.
  const [failedSrc, setFailedSrc] = useState<string>();
  const shapeClasses = `inline-flex shrink-0 items-center justify-center overflow-hidden ${square ? 'rounded-small' : 'rounded-full'} bg-primary-soft ${sizeClasses[size]} ${className}`;

  if (src && failedSrc !== src) {
    // A logo is shown whole on white with a hairline edge; a photo of a person fills the circle.
    const fit = square ? 'object-contain bg-surface shadow-card' : 'object-cover';
    return <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={`${shapeClasses} ${fit}`} />;
  }

  return (
    // An empty alt marks the avatar as decorative (the name is already next to it), so it is hidden from screen readers.
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`font-semibold text-primary uppercase ${shapeClasses}`}
    >
      {initials ? initials.substring(0, 2) : <User size={iconSizes[size]} aria-hidden="true" />}
    </span>
  );
}
