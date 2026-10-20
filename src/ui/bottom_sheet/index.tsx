import type { ReactNode } from 'react';
import type OverlayProps from '../../types/overlay_props';
import OverlayPanel from '../overlay_panel';

interface BottomSheetProps extends OverlayProps {
  /** Content, or a function of `close` for content that dismisses the sheet. */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Accessible name of the sheet; it has no title bar of its own. */
  label?: string;
  /** No padding or scrolling of its own: for content with its own scroll area and a footer that stays in reach. */
  flush?: boolean;
}

export default function BottomSheet({ state, close, children, label, flush = false }: BottomSheetProps) {
  return (
    <OverlayPanel
      state={state}
      close={close}
      from="bottom"
      aria-modal="true"
      aria-label={label}
      // The grab handle is decoration only, so it is the panel's ::before rather than an element.
      className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-panel bg-surface shadow-sheet before:mx-auto before:mt-2.5 before:mb-1 before:h-1 before:w-10 before:shrink-0 before:rounded-full before:bg-border-strong"
    >
      <div className={flush ? 'mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col' : 'mx-auto w-full max-w-lg overflow-y-auto px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]'}>
        {typeof children === 'function' ? children(close) : children}
      </div>
    </OverlayPanel>
  );
}
