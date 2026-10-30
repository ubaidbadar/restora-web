import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../ui/button';

/** Back to the screen they came from, or to the app's home when the page was opened directly. */
export default function BackButton({ fallback = '/' }: { fallback?: string }) {
  const navigate = useNavigate();
  const { key } = useLocation();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={ArrowLeft}
      className="-ms-2.5 min-h-11 self-start text-sm text-muted"
      onClick={() => (key === 'default' ? navigate(fallback) : navigate(-1))}
    >
      Back
    </Button>
  );
}
