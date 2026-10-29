import type FormComponentProps from '../types/form_component_props';

interface SegmentedRadiosProps extends Pick<FormComponentProps, 'register'> {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  /** Checked in the markup, so the form starts with it without defaultValues. */
  defaultValue: string;
}

/**
 * A registered radio group drawn as one segmented control: equal parts in a bordered, sunken track, the picked one
 * tinted with the brand color (as on mobile).
 * The track is as tall as an input. For two to four short choices; more, or long labels, belong in ChipRadios.
 */
export default function SegmentedRadios({ register, name, label, options, defaultValue }: SegmentedRadiosProps) {
  return (
    <fieldset className='text-nowrap'>
      <legend className="sr-only">{label}</legend>
      {/* A fieldset can't be a grid in every browser, so the track is the div inside it. */}
      <div className="grid h-control auto-cols-fr grid-flow-col gap-1 rounded-control border border-border bg-sunken p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center justify-center rounded-small px-2 text-center text-sm font-medium text-body transition-colors hover:text-ink has-checked:bg-primary/10 has-checked:font-semibold has-checked:text-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus"
          >
            <input type="radio" value={option.value} defaultChecked={option.value === defaultValue} className="sr-only" {...register(name)} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
