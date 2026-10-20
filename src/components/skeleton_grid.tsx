import Skeleton from '../ui/skeleton';

interface SkeletonGridProps {
  tiles?: number;
  /** The grid's columns, as the real grid has them. */
  columns?: string;
  /** Each tile's height, as the real tiles. */
  height?: string;
}

/** A grid of cards still loading (tables, dishes, people): tiles the size of the real ones, with a title and a line. */
export default function SkeletonGrid({ tiles = 8, columns = 'grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]', height = 'h-28' }: SkeletonGridProps) {
  return (
    <div role="status" aria-label="Loading" className={`grid gap-2.5 ${columns}`}>
      {Array.from({ length: tiles }, (_, tile) => (
        <div key={tile} className={`flex flex-col gap-2 rounded-card bg-surface p-3 shadow-card ${height}`}>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="mt-auto h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
