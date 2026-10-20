import { useSyncExternalStore } from 'react';

/** Tailwind's breakpoints (index.css sets none of its own), so JS and `md:`/`lg:`/`xl:` classes switch at the same width. */
const QUERIES = { md: '(min-width: 48rem)', lg: '(min-width: 64rem)', xl: '(min-width: 80rem)' } as const;

type Breakpoints = Record<keyof typeof QUERIES, boolean>;

let lists: MediaQueryList[] | undefined;
const getLists = () => (lists ??= Object.values(QUERIES).map((query) => window.matchMedia(query)));

// One object per combination, so the snapshot only changes when a breakpoint is crossed.
const snapshots = new Map<string, Breakpoints>();
function getSnapshot(): Breakpoints {
  const [md, lg, xl] = getLists().map((list) => list.matches) as [boolean, boolean, boolean];
  const key = `${+md}${+lg}${+xl}`;
  if (!snapshots.has(key)) snapshots.set(key, { md, lg, xl });
  return snapshots.get(key)!;
}

// Components using the hook. The media-query lists get one listener between them, added for the first and removed
// after the last.
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((onChange) => onChange());

function subscribe(onChange: () => void) {
  if (!subscribers.size) getLists().forEach((list) => list.addEventListener('change', notify));
  subscribers.add(onChange);
  return () => {
    subscribers.delete(onChange);
    if (!subscribers.size) getLists().forEach((list) => list.removeEventListener('change', notify));
  };
}

/**
 * Which of Tailwind's widths the window is at least: `md` tablet, `lg` desktop (sidebar), `xl` wide desktop. For screens
 * that build a different layout per width, so only one is rendered; pure styling stays in CSS classes, which cost nothing.
 * Every component shares the same three media-query listeners.
 */
export default function useBreakpoint(): Breakpoints {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Tests only: forget the media-query lists, after replacing `window.matchMedia`. */
export function resetBreakpoints() {
  if (subscribers.size) lists?.forEach((list) => list.removeEventListener('change', notify));
  subscribers.clear();
  lists = undefined;
  snapshots.clear();
}
