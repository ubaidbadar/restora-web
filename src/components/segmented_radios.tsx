import type FormComponentProps from '../types/form_component_props';

interface SegmentedRadiosProps extends Pick<FormComponentProps, 'register'> {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  /** Checked in the markup, so the form starts with it without defaultValues. */
  defaultValue: string;
}

/**
 * A registered radio group drawn as one segmented control: equal parts in a sunken track, the picked one raised.
 * For two to four short choices; more, or long labels, belong in ChipRadios.
 */
export default function SegmentedRadios({ register, name, label, options, defaultValue }: SegmentedRadiosProps) {
  return (
    <fieldset className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-sunken p-1">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-10 cursor-pointer items-center justify-center rounded-small px-2 text-center text-sm font-medium text-body transition-colors hover:text-ink has-checked:bg-surface has-checked:font-semibold has-checked:text-ink has-checked:shadow-card has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus"
        >
          <input type="radio" value={option.value} defaultChecked={option.value === defaultValue} className="sr-only" {...register(name)} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
