import { useEffect, useRef, useState, type ReactNode } from 'react';

interface VirtualListProps<T extends { _id: string }> {
  items: T[];
  /** Every row has this height in pixels, gap included. */
  rowHeight: number;
  renderRow: (item: T) => ReactNode;
  label: string;
}

const OVERSCAN = 6;

/** Renders only the rows near the viewport, so a list of thousands scrolls like a list of twenty. */
export default function VirtualList<T extends { _id: string }>({ items, rowHeight, renderRow, label }: VirtualListProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(0);
  const visibleCount = Math.ceil(window.innerHeight / rowHeight) + OVERSCAN * 2;

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      const top = listRef.current?.getBoundingClientRect().top ?? 0;
      setStart(Math.max(0, Math.floor(-top / rowHeight) - OVERSCAN));
    };
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rowHeight]);

  // After a search shortens the list, the remembered position may be past its end.
  const first = Math.min(start, Math.max(0, items.length - visibleCount));

  return (
    <ul ref={listRef} aria-label={label} className="relative" style={{ blockSize: items.length * rowHeight }}>
      {items.slice(first, first + visibleCount).map((item, index) => (
        <li key={item._id} className="absolute inset-x-0" style={{ blockSize: rowHeight, top: (first + index) * rowHeight }}>
          {renderRow(item)}
        </li>
      ))}
    </ul>
  );
}
