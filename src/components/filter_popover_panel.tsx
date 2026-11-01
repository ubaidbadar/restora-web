import { useEffect, useId, type ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import useAnchoredPosition from '../hooks/useAnchoredPosition';
import useDismiss from '../hooks/useDismiss';
import type OverlayProps from '../types/overlay_props';
import type Placement from '../types/placement';
import DialogHeader from '../ui/dialog_header';
import FilterForm from './filter_form';

const GAP = 8;
/** Room kept from the window's edges. */
const EDGE = 16;

type FilterPopoverPanelProps = OverlayProps &
  Omit<ComponentProps<typeof FilterForm>, 'close'> & {
    title: string;
    /** The id of the button that opened it: the panel hangs from it. */
    anchorId: string;
  };

// Under the button with their end edges lined up, kept inside the window; above it when there is more room there.
const placePanel: Placement = (anchor, panel) => {
  const below = window.innerHeight - anchor.bottom;
  const top = below < panel.height + GAP && anchor.top > below ? anchor.top - panel.height - GAP : anchor.bottom + GAP;
  const left = Math.min(Math.max(EDGE, anchor.right - panel.width), window.innerWidth - panel.width - EDGE);
  return { top: Math.max(EDGE, top), left };
};

/** A filter on a tablet or a computer: a panel hanging from its button. A click outside, Escape or × closes it unapplied. */
export default function FilterPopoverPanel({ anchorId, title, state, open: _, close, ...form }: FilterPopoverPanelProps) {
  const titleId = useId();
  const { anchorRef, floatingRef, floatingStyle } = useAnchoredPosition(state === 'active', placePanel);
  useDismiss(state === 'active', [anchorRef, floatingRef], close);
  // Focus moves into the panel as it opens, so Tab reaches its fields next.
  useEffect(() => floatingRef.current?.focus({ preventScroll: true }), [floatingRef]);

  return createPortal(
    <div
      ref={(node) => {
        floatingRef.current = node;
        anchorRef.current = document.getElementById(anchorId);
      }}
      style={floatingStyle}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`z-50 flex max-h-[calc(100dvh-2rem)] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-card bg-surface shadow-lg outline-hidden ${state === 'active' ? 'animate-pop-in motion-reduce:animate-none' : 'opacity-0 transition-opacity'}`}
    >
      <DialogHeader title={title} titleId={titleId} closeLabel="Close" close={close} />
      <FilterForm {...form} close={close} />
    </div>,
    document.body,
  );
}
