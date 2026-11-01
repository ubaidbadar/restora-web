import type { LucideIcon } from 'lucide-react';
import type FormComponentProps from '../types/form_component_props';

interface ChoiceCardsProps<T extends string> {
  /** The form field. */
  name: string;
  label: string;
  options: { value: T; label: string; icon: LucideIcon; /** A few words under the label on what the choice means. */ hint?: string }[];
  /** The option checked at the start; the form keeps it after that. */
  value: T;
  register: FormComponentProps['register'];
  className?: string;
}

/**
 * A choice that changes what happens next (order type, how the order is paid): two or three tiles side by side, each
 * with an icon and, when it helps, a hint. The picked tile is edged in ink and marked with a dot.
 */
export default function ChoiceCards<T extends string>({ name, label, options, value, register, className = '' }: ChoiceCardsProps<T>) {
  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className={`grid gap-2 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map(({ value: optionValue, label: optionLabel, icon: Icon, hint }) => (
          <label
            key={optionValue}
            className="group relative flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-control border border-border bg-surface px-2 py-2.5 text-center transition-colors hover:border-border-strong has-checked:border-primary  has-checked:shadow-[inset_0_0_0_1px_var(--color-primary)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
          >
            <input type="radio" value={optionValue} className="sr-only" defaultChecked={optionValue === value} {...register(name)} />
            <span aria-hidden className="absolute end-1.5 top-1.5 hidden size-2 rounded-pill bg-ink group-has-checked:block" />
            <Icon aria-hidden className="size-5 text-muted group-has-checked:text-primary" />
            <span className="text-sm leading-tight font-semibold group-has-checked:text-primary">{optionLabel}</span>
            {hint && <span className="text-xs leading-tight text-muted">{hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
