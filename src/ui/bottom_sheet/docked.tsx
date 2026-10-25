import type { ReactNode } from 'react';
import useBreakpoint from '../../hooks/useBreakpoint';
import type OverlayTrigger from '../../types/overlay_trigger';
import BottomSheet from './modal';

interface DockedSheetProps {
  /** The sheet's accessible name, e.g. "Order". */
  label: string;
  /** What opens the sheet on phones (e.g. a bar with the total); not shown from tablet width. */
  component: OverlayTrigger;
  children: ReactNode;
  /** Extra classes for the docked column (tablet width and up). */
  className?: string;
}

/**
 * A BottomSheet on phones, opened by `component`; from tablet width (md) up the same content is docked in place as a
 * sticky column instead. The sheet's content exists only while it is open: form fields inside keep their values in the
 * form, but a submit button there sits outside the <form> (the sheet is a portal), so it names the form with `form`.
 */
export default function DockedSheet({ label, component, children, className = '' }: DockedSheetProps) {
  const { lg } = useBreakpoint();

  if (!lg) {
    return (
      <BottomSheet label={label} flush component={component}>
        {children}
      </BottomSheet>
    );
  }
  return (
    <>
      <section aria-label={label} className={`fixed w-90 bottom-8 top-4 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-card bg-surface shadow-card lg:top-8 ${className}`}>
        {children}
      </section>
    </>
  );
}
