import { DetailedHTMLProps, LabelHTMLAttributes } from 'react';
import FieldError from './field_error';

interface FieldShellProps extends DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export default function FieldShell({ label, required, error, children, className, ...props }: FieldShellProps) {
  return (
    <label className={`flex flex-col gap-2 ${className || ''}`} {...props}>
      {label && (
        <span>
          {label}
          {required && (
            <span className="text-danger-700 ms-0.5" aria-hidden="true">*</span>
          )}
        </span>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </label>
  );
}
