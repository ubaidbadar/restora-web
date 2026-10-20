import { type ReactNode } from 'react';
import type ChoiceFieldProps from '../types/choice_field_props';
import FieldError from './field_error';

interface ChoiceFieldBaseProps extends ChoiceFieldProps {
  type: 'checkbox' | 'radio';
  inputClassName: string;
  /** Drawn over the native control, e.g. a check icon. */
  indicator?: ReactNode;
}

/** Control left, label right: the layout shared by Checkbox and Radio. */
export default function ChoiceField({
  type,
  inputClassName,
  indicator,
  className = '',
  label,
  error,
  required,
  ...props
}: ChoiceFieldBaseProps) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <span className="relative flex items-center justify-center pt-0.5">
        <input
          type={type}
          className={inputClassName}
          {...props}
          required={required}
          aria-invalid={!!error}
          aria-required={required}
        />
        {indicator}
      </span>
      {label && (
        <span className="flex flex-col">
          <span className="text-sm text-ink leading-5 select-none">
            {label}
            {required && (
              <span className="text-danger-700 ms-0.5" aria-hidden="true">*</span>
            )}
          </span>
          <FieldError className="mt-1 text-xs">{error}</FieldError>
        </span>
      )}
    </label>
  );
}
