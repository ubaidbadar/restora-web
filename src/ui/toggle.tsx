import type { InputHTMLAttributes } from 'react';
import FieldError from './field_error';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export default function Toggle({ className = '', label, error, ...props }: ToggleProps) {
  return (
    <label className={`inline-flex flex-col gap-2 cursor-pointer has-disabled:opacity-50 has-disabled:cursor-not-allowed ${className}`}>
      <span className="inline-flex items-center gap-3">
        <input type="checkbox" role="switch" className="peer sr-only" {...props} aria-invalid={!!error} />
        {/* Track; the knob is its ::after. The input is visually hidden, so the track shows its focus. */}
        <span
          aria-hidden="true"
          className="relative h-6 w-11 shrink-0 rounded-full bg-border-strong transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus after:absolute after:top-0.5 after:inset-s-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
        />
        {label && <span className="text-sm font-medium text-ink select-none">{label}</span>}
      </span>
      <FieldError>{error}</FieldError>
    </label>
  );
}
