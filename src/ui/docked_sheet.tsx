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
 * Below desktop width, order details open in the existing bottom sheet. On desktop they can stay in a right-hand column
 * or open in a drawer. The overlay's submit button sits outside the form, so it names the form with `form`.
 */
export default function DockedSheet({ label, component, children, className = '', mode = 'column' }: DockedSheetProps) {
  const { lg } = useBreakpoint();

  if (!lg) {
    return (
      <ModalOverlay title={label} flush component={component}>
        {children}
      </ModalOverlay>
    );
  }
  if (mode === 'drawer') {
    return (
      <Drawer title={label} width="md" component={component}>
        {children}
      </Drawer>
    );
  }
  return (
    <section aria-label={label} className={`fixed w-90 bottom-8 top-4 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-card bg-surface shadow-card lg:top-8 ${className}`}>
      {children}
    </section>
  );
}
