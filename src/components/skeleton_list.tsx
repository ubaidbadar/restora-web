import Skeleton from '../ui/skeleton';

const WIDTHS = ['w-2/5', 'w-1/3', 'w-1/2', 'w-1/4'];

interface SkeletonListProps {
  rows?: number;
  /** `cards`: rows as separate cards on the page (customers, reservations). `lines`: rows inside one card (settings lists). */
  variant?: 'cards' | 'lines';
}

/** A list still loading: rows shaped like the real ones (a round picture, two lines, a value on the end). */
export default function SkeletonList({ rows = 5, variant = 'cards' }: SkeletonListProps) {
  return (
    <div role="status" aria-label="Loading" className={variant === 'cards' ? 'flex flex-col gap-2.5' : 'divide-y divide-border'}>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className={`flex items-center gap-3 ${variant === 'cards' ? 'h-18 rounded-card bg-surface px-4 shadow-card' : 'h-16 px-5 sm:px-6'}`}>
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className={`h-3.5 ${WIDTHS[row % WIDTHS.length]}`} />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-3.5 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}
