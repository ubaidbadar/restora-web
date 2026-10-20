import { useEffectEvent, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type Placement from '../types/placement';

interface Position {
  top: number;
  left: number;
}

// Coordinates must snap: an inherited `transition-property: all` would otherwise animate the
// element in from its unplaced spot and make it trail behind the anchor while scrolling.
const PLACED: CSSProperties = { position: 'fixed', transitionProperty: 'none' };
// Transparent rather than `visibility: hidden` so content can take focus (e.g. autoFocus) before it is placed.
const UNPLACED: CSSProperties = { ...PLACED, top: 0, left: 0, opacity: 0, pointerEvents: 'none' };

/**
 * Positions a `position: fixed` element (usually portaled) next to an anchor,
 * and keeps it anchored while the page scrolls or resizes.
 */
export default function useAnchoredPosition<
  Anchor extends HTMLElement = HTMLElement,
  Floating extends HTMLElement = HTMLDivElement,
>(isOpen: boolean, place: Placement) {
  const anchorRef = useRef<Anchor>(null);
  const floatingRef = useRef<Floating>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const update = useEffectEvent(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    setPosition(
      place(anchor.getBoundingClientRect(), {
        width: floating.offsetWidth,
        height: floating.offsetHeight,
      }),
    );
  });

  useLayoutEffect(() => {
    if (!isOpen) return;

    const handleChange = () => update();
    handleChange();
    window.addEventListener('resize', handleChange);
    window.addEventListener('scroll', handleChange, true);

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('scroll', handleChange, true);
    };
  }, [isOpen]);

  const floatingStyle: CSSProperties = isOpen && position ? { ...PLACED, ...position } : UNPLACED;

  return { anchorRef, floatingRef, floatingStyle };
}
