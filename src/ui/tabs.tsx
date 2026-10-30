import type FormComponentProps from '../types/form_component_props';

interface TabsProps<T extends string> {
  /** The radio group's name; with `register`, the form field. */
  name: string;
  label: string;
  options: { value: T; label: string; count?: number }[];
  /** The picked option. With `register` it is only the one checked at the start; the form keeps it after that. */
  value: T;
  onChange?: (value: T) => void;
  /** Makes the group a form field instead of calling `onChange`. */
  register?: FormComponentProps['register'];
  /** Wrap onto more lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Stretch across the row, the options sharing the width (a form's segmented choice). */
  fill?: boolean;
  className?: string;
}

/**
 * The one tab strip of the app: page tabs, filters and picked-one choices in forms. A sunken grey track, edged with a border, with the
 * picked option raised on the surface. Built from radios, so arrow keys move between options.
 */
export default function Tabs<T extends string>({ name, label, options, value, onChange, register, wrap = false, fill = false, className = '' }: TabsProps<T>) {
  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className="sr-only">{label}</legend>
      {/* A fieldset can't be a flex box in every browser, so the track is the div inside it. */}
      <div className={`flex max-w-full gap-1 rounded-control border border-border bg-sunken p-1 ${fill ? '' : 'w-fit'} ${wrap ? 'flex-wrap' : 'hide-scrollbar overflow-x-auto'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            // On a narrow screen the picked tab may sit past the edge (e.g. ?tab=account): bring it into view.
            ref={!register && option.value === value ? (element) => element?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) : undefined}
            // `relative` holds the sr-only radio inside its label: otherwise, past the edge of a scrolling strip, it widens the page.
            className="group relative flex min-h-9 shrink-0 grow cursor-pointer items-center justify-center gap-2 rounded-small px-3 py-1.5 text-center text-sm font-medium whitespace-nowrap text-body transition-colors hover:text-ink has-checked:bg-surface has-checked:font-semibold has-checked:text-ink has-checked:shadow-card has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus"
          >
            <input
              type="radio"
              value={option.value}
              className="sr-only"
              {...(register
                ? { defaultChecked: option.value === value, ...register(name) }
                : { name, checked: option.value === value, onChange: () => onChange?.(option.value) })}
            />
            {option.label}
            {option.count !== undefined && (
              <span className="min-w-5 rounded-pill bg-surface px-1.5 text-xs text-muted tabular-nums group-has-checked:bg-sunken">{option.count}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
