
interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="min-w-0 bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
      <p className="truncate text-sm text-muted">{label}</p>
      <p className="mt-1 truncate text-metric tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
    </div>
  );
}
