import { useEffect, useEffectEvent } from 'react';

// Open overlays, topmost last. Its length doubles as the body scroll-lock count.
const overlayStack: symbol[] = [];
let previousBodyOverflow = '';

/** Locks body scroll and closes the topmost open overlay on Escape. */
export default function useOverlay(active: boolean, onClose: () => void) {
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!active) return;
    const id = Symbol('overlay');
    if (overlayStack.length === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    overlayStack.push(id);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && overlayStack.at(-1) === id) close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      overlayStack.splice(overlayStack.lastIndexOf(id), 1);
      if (overlayStack.length === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, [active]);
}
