import { useId, type ReactNode } from 'react';
import type OverlayFooter from '../../types/overlay_footer';
import type OverlayProps from '../../types/overlay_props';
import DialogFooter from '../dialog_footer';
import DialogHeader from '../dialog_header';
import OverlayPanel from '../overlay_panel';

interface ModalProps extends OverlayProps {
  title: string;
  /** Content, or a function of `close` for content that dismisses the modal. */
  children: ReactNode | ((close: () => void) => ReactNode);
  footer?: OverlayFooter;
  /** No padding or scrolling of its own: for content with its own scroll area and a footer that stays in reach. */
  flush?: boolean;
  /** Wider layout for pickers and other content that benefits from more room. */
  size?: 'default' | 'lg';
  /** Keep this modal attached to the bottom as a full-width sheet at every viewport size. */
  presentation?: 'center' | 'bottom';
}

/**
 * The app's one modal: a sheet from the bottom on a phone, a card in the middle from `sm` up. Always a title and a close
 * button. On a phone the last thing in it stays above the home indicator; flush content does that itself (`pb-safe`).
 */
export default function Modal({ state, close, title, children, footer, flush = false, size = 'default', presentation = 'center' }: ModalProps) {
  const titleId = useId();
  const body = flush ? 'flex min-h-0 flex-1 flex-col' : `overflow-y-auto overscroll-contain px-5 pt-5 sm:px-6 ${footer ? 'pb-5' : 'pb-safe sm:pb-5'}`;
  const bottomSheet = presentation === 'bottom';

  return (
    <OverlayPanel
      state={state}
      close={close}
      from={bottomSheet ? 'bottom' : 'modal'}
      aria-modal="true"
      aria-labelledby={titleId}
      className={bottomSheet
        ? 'flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-panel bg-surface shadow-sheet'
        : `flex max-h-full w-full flex-col overflow-hidden rounded-t-panel bg-surface shadow-sheet ${size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-lg'} sm:rounded-panel sm:shadow-lg`}
    >
      <DialogHeader title={title} titleId={titleId} closeLabel="Close" close={close} />
      <div className={body}>{typeof children === 'function' ? children(close) : children}</div>
      {footer && <DialogFooter className="max-sm:pb-safe">{typeof footer === 'function' ? footer(close) : footer}</DialogFooter>}
    </OverlayPanel>
  );
}
