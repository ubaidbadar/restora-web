import type { ReactNode } from 'react';
import useBreakpoint from '../hooks/useBreakpoint';
import type OverlayTrigger from '../types/overlay_trigger';
import ModalOverlay from './modal/modal';

interface DockedSheetProps {
  /** The sheet's title, e.g. "Order". */
  label: string;
  /** What opens the sheet on phones (e.g. a bar with the total); not shown from tablet width. */
  component: OverlayTrigger;
  children: ReactNode;
  /** Extra classes for the docked column (tablet width and up). */
  className?: string;
}

/**
 * A modal (a sheet from the bottom on a phone) below desktop width, opened by `component`; from desktop width (lg) up the same content is docked in place as a
 * sticky column instead. The sheet's content exists only while it is open: form fields inside keep their values in the
 * form, but a submit button there sits outside the <form> (the sheet is a portal), so it names the form with `form`.
 */
export default function DockedSheet({ label, component, children, className = '' }: DockedSheetProps) {
  const { lg } = useBreakpoint();

  if (!lg) {
    return (
      <ModalOverlay title={label} flush component={component}>
        {children}
      </ModalOverlay>
    );
  }
  return (
    <section aria-label={label} className={`sticky top-8 flex h-[calc(100dvh-4rem)] min-w-0 w-full flex-col overflow-hidden rounded-card bg-surface shadow-card ${className}`}>
      {children}
    </section>
  );
}
