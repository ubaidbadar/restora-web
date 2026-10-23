import type FormComponentProps from '../types/form_component_props';

interface ChipRadiosProps extends Pick<FormComponentProps, 'register'> {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  /** Checked in the markup, so the form starts with it without defaultValues. */
  defaultValue: string;
  /** Smaller chips, for a secondary choice inside a panel. */
  compact?: boolean;
}

/** A registered radio group drawn as chips. The browser keeps the checked state; the chip styles follow it. */
export default function ChipRadios({ register, name, label, options, defaultValue, compact = false }: ChipRadiosProps) {
  return (
    <fieldset className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={`inline-flex cursor-pointer items-center rounded-control border border-border-strong bg-surface text-sm font-medium ${compact ? 'min-h-9 px-2.5' : 'min-h-control px-3.5'} whitespace-nowrap text-body transition-colors hover:bg-sunken has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus`}
        >
          <input type="radio" value={option.value} defaultChecked={option.value === defaultValue} className="sr-only" {...register(name)} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
