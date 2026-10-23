import Pill from '../ui/pill';

interface ChipOption<T extends string> {
  value: T;
  label: string;
  /** Shown after the label, e.g. how many orders are in this status. */
  count?: number;
}

interface ChoiceChipsProps<T extends string> {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Wrap onto more lines instead of scrolling sideways, so the selected chip is never off screen. */
  wrap?: boolean;
  className?: string;
}

/** A row of large tap targets where exactly one is selected. Scrolls sideways on narrow screens unless `wrap` is set. */
export default function ChoiceChips<T extends string>({ label, options, value, onChange, wrap = false, className = '' }: ChoiceChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className={`-mx-1 flex gap-2 p-1 ${wrap ? 'flex-wrap' : 'hide-scrollbar overflow-x-auto'} ${className}`}>
      {options.map((option) => (
        <Pill
          key={option.value}
          isActive={option.value === value}
          onClick={() => onChange(option.value)}
          className="min-h-control shrink-0 px-3.5! text-sm! whitespace-nowrap"
        >
          {option.label}
          {option.count !== undefined && (
            <span className={`ms-2 min-w-5 rounded-small px-1 text-xs tabular-nums ${option.value === value ? 'bg-on-primary/15' : 'bg-sunken text-muted'}`}>{option.count}</span>
          )}
        </Pill>
      ))}
    </div>
  );
}
