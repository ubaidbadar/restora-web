import { useEffect, useEffectEvent, type RefObject } from 'react';

type DismissReason = 'outside' | 'escape';

/** Calls `onDismiss` on a mousedown outside every given element, or on Escape. */
export default function useDismiss(
  isOpen: boolean,
  refs: RefObject<HTMLElement | null>[],
  onDismiss: (reason: DismissReason) => void,
) {
  const dismiss = useEffectEvent(onDismiss);
  const isInside = useEffectEvent((target: Node) => refs.some((ref) => ref.current?.contains(target)));

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!isInside(event.target as Node)) dismiss('outside');
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss('escape');
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
}
