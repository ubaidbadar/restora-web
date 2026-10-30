import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../ui/button';
import IconButton from '../ui/icon_button';

interface BackButtonProps {
  /** Where "back" is: the page above this one (e.g. `/settings`). Without it, the screen they came from, or `fallback`. */
  to?: string;
  /** Names that page, e.g. "Settings". */
  label?: string;
  fallback?: string;
  /** Only the arrow, e.g. beside the logo. */
  iconOnly?: boolean;
  className?: string;
}

/** The one way back up a level: grey, at the top start of the page. */
export default function BackButton({ to, label = 'Back', fallback = '/', iconOnly = false, className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  const { key } = useLocation();
  const goBack = () => (to ? navigate(to) : key === 'default' ? navigate(fallback) : navigate(-1));

  if (iconOnly) return <IconButton icon={ArrowLeft} variant="ghost" aria-label={label} onClick={goBack} className={`-ms-2 size-11 rtl:-scale-x-100 ${className}`} />;

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={ArrowLeft}
      className={`-ms-2.5 min-h-11 self-start text-sm text-muted! hover:text-ink! ${className}`}
      onClick={goBack}
    >
      {label}
    </Button>
  );
}
