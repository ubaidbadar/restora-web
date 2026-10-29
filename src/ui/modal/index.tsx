import { useId, type ReactNode } from 'react';
import type OverlayFooter from '../../types/overlay_footer';
import type OverlayProps from '../../types/overlay_props';
import DialogFooter from '../dialog_footer';
import DialogHeader from '../dialog_header';
import OverlayPanel from '../overlay_panel';

interface ModalProps extends OverlayProps {
  title?: string;
  children: ReactNode;
  footer?: OverlayFooter;
  className?: string;
}

export default function Modal({ state, close, title, children, footer, className = '' }: ModalProps) {
  const titleId = useId();

  return (
    <OverlayPanel
      state={state}
      close={close}
      from="center"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className={`flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-panel bg-surface shadow-lg ${className}`}
    >
      <DialogHeader title={title} titleId={titleId} closeLabel="Close modal" close={close} />
      <div className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
      {footer && <DialogFooter>{typeof footer === 'function' ? footer(close) : footer}</DialogFooter>}
    </OverlayPanel>
  );
}
