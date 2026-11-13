import type { ReactNode } from 'react';
import useBreakpoint from '../hooks/useBreakpoint';
import type OverlayTrigger from '../types/overlay_trigger';
import ModalOverlay from './modal/modal';

interface DockedSheetProps {
  /** The sheet's title, e.g. "Order". */
  label: string;
  /** What opens the sheet below wide-desktop width (e.g. a bar with the total). */
  component: OverlayTrigger;
  children: ReactNode;
  /** Extra classes for the docked column on wide desktops. */
  className?: string;
}

/**
 * Below wide-desktop width the order opens in a sheet. At xl the same content docks beside the menu, where both columns
 * can be used together without squeezing the menu on laptop and tablet-sized screens.
 */
export default function DockedSheet({ label, component, children, className = '' }: DockedSheetProps) {
  const { xl } = useBreakpoint();

  if (!xl) {
    return (
      <ModalOverlay title={label} flush component={component}>
        {children}
      </ModalOverlay>
    );
  }
  return (
    <section aria-label={label} className={`fixed w-90 bottom-8 top-4 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-card bg-surface shadow-card xl:top-8 ${className}`}>
      {children}
    </section>
  );
}
