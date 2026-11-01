import { Check } from 'lucide-react';
import THEMES from '../../../constants/themes';
import type FormComponentProps from '../../../types/form_component_props';

interface ThemeCardsProps {
  /** The theme saved now, checked at the start; the form keeps the pick after that. */
  value: string;
  register: FormComponentProps['register'];
}

/** A dash of a screen in a preview: a line of text, or a button. */
const line = 'block h-1.5 rounded-pill';

/**
 * The themes as cards to pick from. Each card draws the theme itself (its colours come from `data-theme`): the sidebar,
 * then a light and a dark screen with a button, so both sides of the theme show before it is picked.
 */
export default function ThemeCards({ value, register }: ThemeCardsProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Theme</legend>
      <div className="grid grid-cols-1 gap-3 min-[30rem]:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme) => (
          <label
            key={theme.value}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-border-strong has-checked:border-primary has-checked:shadow-[inset_0_0_0_1px_var(--color-primary)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
          >
            <input type="radio" value={theme.value} className="sr-only" defaultChecked={theme.value === value} {...register('appearance.theme')} />
            <span aria-hidden data-theme={theme.value} className="flex h-24">
              <span className="flex w-[30%] flex-col gap-1.5 bg-sidebar p-2.5">
                <span className="block h-2.5 rounded-chip bg-sidebar-accent" />
                <span className={`${line} bg-sidebar-accent/30`} />
                <span className={`${line} bg-sidebar-accent/30`} />
                <span className={`${line} w-2/3 bg-sidebar-accent/30`} />
              </span>
              <span className="flex flex-1 flex-col gap-1.5 bg-preview-light p-2.5">
                <span className={`${line} w-3/4 bg-preview-light-line`} />
                <span className={`${line} bg-preview-light-line`} />
                <span className="mt-auto block h-3.5 w-3/4 rounded-chip bg-theme-light" />
              </span>
              <span className="flex flex-1 flex-col gap-1.5 bg-preview-dark p-2.5">
                <span className={`${line} w-3/4 bg-preview-dark-line`} />
                <span className={`${line} bg-preview-dark-line`} />
                <span className="mt-auto block h-3.5 w-3/4 rounded-chip bg-theme-dark" />
              </span>
            </span>
            <span className="flex min-h-11 items-center gap-2 border-t border-border px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="font-semibold text-ink">{theme.label}</span>
                <span className="text-muted"> · {theme.mood}</span>
              </span>
              <span className="hidden size-5 items-center justify-center rounded-pill bg-primary text-on-primary group-has-checked:flex">
                <Check aria-hidden className="size-3.5" strokeWidth={3} />
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
