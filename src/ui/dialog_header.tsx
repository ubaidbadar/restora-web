import { X } from 'lucide-react';
import IconButton from './icon_button';

interface DialogHeaderProps {
  title?: string;
  /** Put on the heading so the dialog can be named by it (aria-labelledby). */
  titleId?: string;
  closeLabel: string;
  close: () => void;
}

export default function DialogHeader({ title, titleId, closeLabel, close }: DialogHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface py-3 ps-5 pe-3 sm:ps-6">
      {title && (
        <h2 id={titleId} dir="auto" className="m-0 min-w-0 truncate text-heading text-ink">
          {title}
        </h2>
      )}
      <IconButton icon={X} onClick={close} aria-label={closeLabel} className="ms-auto" />
    </div>
  );
}
