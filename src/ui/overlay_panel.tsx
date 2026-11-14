import { useEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type OverlayProps from '../types/overlay_props';

// Where the panel sits, and the offset it enters from (@starting-style) and leaves to (the 'close' state). A modal is a
// sheet sliding up from the bottom of a phone (clear of the notch) and a card fading in at the centre from `sm` up.
const placements = {
  modal: {
    container: 'flex-col justify-end pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-center sm:justify-center sm:p-6',
    enter: 'max-sm:starting:translate-y-full sm:starting:scale-97 sm:starting:opacity-0',
    exit: 'max-sm:translate-y-full sm:scale-97 sm:opacity-0',
  },
  bottom: {
    container: 'flex-col justify-end pt-[max(0.75rem,env(safe-area-inset-top))]',
    enter: 'starting:translate-y-full',
    exit: 'translate-y-full',
  },
  right: { container: 'justify-end', enter: 'starting:translate-x-full', exit: 'translate-x-full' },
};

interface OverlayPanelProps extends Pick<OverlayProps, 'state' | 'close'>, HTMLAttributes<HTMLDivElement> {
  from: keyof typeof placements;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * For a keydown handled on the panel: the element focus should wrap to when this Tab press
 * would move focus out of the panel, otherwise null.
 */
const getTabWrapTarget = (event: KeyboardEvent<HTMLElement>): HTMLElement | null => {
  if (event.key !== 'Tab') return null;

  const container = event.currentTarget;
  const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = focusable[0] ?? container;
  const last = focusable.at(-1) ?? container;
  const active = document.activeElement;

  if (event.shiftKey) return active === first || active === container ? last : null;
  return active === last ? first : null;
};

/**
 * Backdrop + dialog panel shared by Modal and Drawer. Animated in CSS only: the enter
 * transition starts from @starting-style, the exit plays during useShow's 'close' window.
 * Focus moves into the panel when it opens and Tab stays inside it; useShow returns focus to the opener on close.
 */
export default function OverlayPanel({ state, close, from, className = '', children, ...panelProps }: OverlayPanelProps) {
  const { container, enter, exit } = placements[from];
  const isClosing = state === 'close';
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    // Content with autoFocus has already taken focus; otherwise the dialog itself receives it.
    if (panel && !panel.contains(document.activeElement)) panel.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // A popover inside the panel (e.g. DatePicker) may already have handled this Tab.
    const wrapTarget = event.defaultPrevented ? null : getTabWrapTarget(event);
    if (!wrapTarget) return;
    event.preventDefault();
    wrapTarget.focus();
  };

  return createPortal(
    // The container is the backdrop: a click on it, not on the panel, closes.
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      className={`fixed inset-0 z-50 flex bg-scrim transition-opacity duration-200 ease-out starting:opacity-0 motion-reduce:transition-none ${container} ${isClosing ? 'pointer-events-none opacity-0' : ''}`}
    >
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`outline-hidden transition-[translate,scale,opacity] duration-300 ease-emphasized motion-reduce:transition-none ${enter} ${isClosing ? exit : ''} ${className}`}
        {...panelProps}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
