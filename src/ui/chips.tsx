import type { LucideIcon } from 'lucide-react';
import type FormComponentProps from '../types/form_component_props';

interface ChipsProps<T extends string> {
  /** The radio group's name; with `register`, the form field. */
  name: string;
  label: string;
  options: { value: T; label: string; count?: number; icon?: LucideIcon }[];
  /** The picked option. With `register` it is only the one checked at the start; the form keeps it after that. */
  value: T;
  onChange?: (value: T) => void;
  /** Makes the group a form field instead of calling `onChange`. */
  register?: FormComponentProps['register'];
  /** Wrap onto more lines (choices in a form) instead of one line that scrolls sideways (a list's filter). */
  wrap?: boolean;
  /** Show the label above the chips (a group in a form), instead of only to screen readers. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Filters and picks from four or more options: each option its own pill, as wide as its words, the picked one filled
 * dark. A filter row scrolls sideways and fades at its end; choices in a form wrap. Built from radios, so arrow keys move.
 * Two or three short options that flip a view are `ui/tabs` instead.
 */
export default function Chips<T extends string>({ name, label, options, value, onChange, register, wrap = false, showLabel = false, className = '' }: ChipsProps<T>) {
  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className={showLabel ? 'mb-2 text-sm font-semibold text-ink' : 'sr-only'}>{label}</legend>
      <div className={`flex gap-2 ${wrap ? 'flex-wrap' : 'hide-scrollbar fade-end overflow-x-auto pe-8'}`}>
        {options.map(({ value: optionValue, label: optionLabel, count, icon: Icon }) => (
          <label
            key={optionValue}
            // On a narrow screen the picked chip may sit past the edge: bring it into view.
            ref={!register && optionValue === value ? (element) => element?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) : undefined}
            // `relative` holds the sr-only radio inside its label: otherwise, past the edge of a scrolling row, it widens the page.
            className="group relative flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-body transition-colors hover:border-border-strong hover:text-ink has-checked:border-ink has-checked:bg-ink has-checked:font-semibold has-checked:text-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
          >
            <input
              type="radio"
              value={optionValue}
              className="sr-only"
              {...(register
                ? { defaultChecked: optionValue === value, ...register(name) }
                : { name, checked: optionValue === value, onChange: () => onChange?.(optionValue) })}
            />
            {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
            {optionLabel}
            {count !== undefined && <span className="text-xs font-medium text-muted tabular-nums group-has-checked:text-surface/75">{count}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
