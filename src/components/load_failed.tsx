import { CloudOff, RotateCcw } from 'lucide-react';
import Button from '../ui/button';
import EmptyState from './empty_state';

interface LoadFailedProps {
  /** What did not load, e.g. "the menu". */
  what: string;
  /** Asks the server again: `get` from useGet. */
  onRetry: () => void;
}

/** In place of data that could not be loaded, so the screen is never left blank. useGet has already shown why in a toast. */
export default function LoadFailed({ what, onRetry }: LoadFailedProps) {
  return (
    <EmptyState icon={CloudOff} title={`Couldn't load ${what}`} text="Check the internet connection and try again.">
      <Button icon={RotateCcw} onClick={onRetry}>
        Try again
      </Button>
    </EmptyState>
  );
}
