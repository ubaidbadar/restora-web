import type { ReactNode } from 'react';
import useBreakpoint from '../hooks/useBreakpoint';
import type OverlayTrigger from '../types/overlay_trigger';
import ModalOverlay from './modal/modal';
import Drawer from './drawer/modal';

interface DockedSheetProps {
  /** The sheet's title, e.g. "Order". */
  label: string;
  /** What opens order details when they are not docked (e.g. a cart summary). */
  component: OverlayTrigger;
  children: ReactNode;
  /** Extra classes for the docked column (tablet width and up). */
  className?: string;
  /** Keep the order beside the menu, or open it only when the cart is selected. */
  mode?: 'column' | 'drawer';
}

/**
 * Phones, tablets and compact laptop widths use a full-width bottom sheet. Larger laptop widths use a drawer so the
 * menu is not squeezed; wide screens can keep order details in a right-hand column or open them in a drawer.
 */
export default function DockedSheet({ label, component, children, className = '', mode = 'column' }: DockedSheetProps) {
  const { lg, xl } = useBreakpoint();

  if (!lg) {
    return (
      <ModalOverlay title={label} flush presentation="bottom" component={component}>
        {children}
      </ModalOverlay>
    );
  }
  if (mode === 'drawer' || !xl) {
    return (
      <Drawer title={label} width="md" component={component}>
        {children}
      </Drawer>
    );
  }
  return (
    <section aria-label={label} className={`fixed w-90 bottom-8 top-4 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-card bg-surface shadow-card xl:top-8 ${className}`}>
      {children}
    </section>
  );
}
