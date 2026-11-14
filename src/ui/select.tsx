import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import formInputBaseClasses from '../utils/form_input_base_classes';
import FieldShell from './field_shell';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export default function Select({
  className = '',
  label,
  error,
  options,
  placeholder,
  ...props
}: SelectProps) {

  return (
    <FieldShell label={label} required={props.required} error={error}>
      <span className="flex relative w-full">
        <select
          aria-invalid={!!error}
          aria-required={props.required}
          className={`${formInputBaseClasses} flex-1 py-2 pe-10 appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-subtle">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 inset-e-3 -translate-y-1/2 text-muted"
        />
      </span>
    </FieldShell>
  );
}
