import type InputProps from '../types/input_props';
import formInputBaseClasses from '../utils/form_input_base_classes';
import FieldShell from './field_shell';

export default function Input({
  className = '',
  icon: Icon,
  rightElement,
  error,
  label,
  required,
  ...props
}: InputProps) {
  return (
    <FieldShell label={label} required={required} error={error}>
      <span className="relative block">
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-muted"
          />
        )}
        <input
          className={`${formInputBaseClasses} py-2 ${Icon ? 'ps-10' : ''} ${rightElement ? 'pe-10' : ''} ${className}`}
          {...props}
          aria-invalid={!!error}
          aria-required={required}
        />
        {rightElement && <span className="absolute inset-y-0 inset-e-3 flex items-center">{rightElement}</span>}
      </span>
    </FieldShell>
  );
}
