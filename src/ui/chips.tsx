import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type FormComponentProps from '../types/form_component_props';

interface ChipsProps<T extends string> {
  /** The radio group's name; with `register`, the form field. */
  name: string;
  label: string;
  /** `dot`: something new waits behind this option (e.g. a column with a new order). */
  options: { value: T; label: string; count?: number; icon?: LucideIcon; dot?: boolean }[];
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
  /** Show mouse-friendly controls when a one-line filter overflows. Touch and trackpad scrolling still work. */
  scrollControls?: boolean;
}

/**
 * Filters and picks from four or more options: each option its own pill, as wide as its words, the picked one filled
 * dark. A filter row scrolls sideways and fades at its end; choices in a form wrap. Built from radios, so arrow keys move.
 * Two or three short options that flip a view are `ui/tabs` instead.
 */
export default function Chips<T extends string>({ name, label, options, value, onChange, register, wrap = false, showLabel = false, className = '', scrollControls = false }: ChipsProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  useEffect(() => {
    const element = scrollRef.current;
    if (!scrollControls || wrap || !element) return;

    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      const left = element.scrollLeft > 1;
      const right = max > 1 && element.scrollLeft < max - 1;
      setScrollState((current) => current.left === left && current.right === right ? current : { left, right });
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    observer?.observe(element);
    Array.from(element.children).forEach((child) => observer?.observe(child));

    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [options.length, scrollControls, wrap]);

  const scroll = (direction: -1 | 1) => {
    const element = scrollRef.current;
    element?.scrollBy({ left: direction * Math.max(180, element.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className={showLabel ? 'mb-2 text-sm font-semibold text-ink' : 'sr-only'}>{label}</legend>
      <div className="relative min-w-0">
        <div ref={scrollRef} className={`flex gap-2 ${wrap ? 'flex-wrap' : 'hide-scrollbar fade-end overflow-x-auto pe-8 scroll-smooth'}`}>
        {options.map(({ value: optionValue, label: optionLabel, count, icon: Icon, dot }) => (
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
            {dot && (
              <span className="size-2 shrink-0 rounded-full bg-primary group-has-checked:bg-surface">
                <span className="sr-only">, new</span>
              </span>
            )}
          </label>
        ))}
        </div>
        {scrollControls && !wrap && scrollState.left && (
          <button type="button" aria-label={`Scroll ${label.toLowerCase()} left`} onClick={() => scroll(-1)} className="absolute start-0 top-1/2 z-10 hidden size-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-focus md:grid">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        )}
        {scrollControls && !wrap && scrollState.right && (
          <button type="button" aria-label={`Scroll ${label.toLowerCase()} right`} onClick={() => scroll(1)} className="absolute end-0 top-1/2 z-10 hidden size-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-focus md:grid">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </fieldset>
  );
}
