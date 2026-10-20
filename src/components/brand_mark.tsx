import RestoraIcon from '../icons/restora_icon';
import RestoraWordmark from '../icons/restora_wordmark';

interface BrandMarkProps {
  /** Text color, which the wordmark takes: text-ink on light backgrounds, text-surface on dark ones. */
  className?: string;
}

/** The logo: app icon and wordmark, spaced as in brand/src/logo.svg. */
export default function BrandMark({ className = 'text-ink' }: BrandMarkProps) {
  return (
    <span role="img" aria-label="Restora" className={`inline-flex items-center gap-[0.5625rem] ${className}`}>
      <RestoraIcon className="size-7 shrink-0" />
      <RestoraWordmark className="h-4 w-auto" />
    </span>
  );
}
