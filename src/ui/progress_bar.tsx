

interface ProgressBarProps {
  value: number;
  ariaLabel: string;
  className?: string;
  indicatorClassName?: string;
}

export default function ProgressBar({
  value,
  ariaLabel,
  className = '',
  indicatorClassName = '',
}: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
      className={`h-2 overflow-hidden rounded-pill bg-sunken ${className}`}
    >
      <div
        className={`h-full rounded-pill bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none ${indicatorClassName}`}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}
