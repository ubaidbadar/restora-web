import type InputProps from '../types/input_props';
import formInputBaseClasses from '../utils/form_input_base_classes';
import FieldShell from './field_shell';

const PICKER_TYPES = new Set(['date', 'time', 'datetime-local', 'month', 'week']);

export default function Input({
  className = '',
  icon: Icon,
  rightElement,
  error,
  label,
  required,
  onClick,
  ...props
}: InputProps) {
  const isPicker = Boolean(props.type && PICKER_TYPES.has(props.type));

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (isPicker && !props.readOnly && !props.disabled) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          event.currentTarget.showPicker();
        } catch {
          // ignore if picker is already visible or unsupported
        }
      }
    }
    onClick?.(event);
  };

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
          className={`${formInputBaseClasses} py-2 ${Icon ? 'ps-10' : ''} ${rightElement ? 'pe-10' : ''} ${isPicker ? 'cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer' : ''} ${className}`}
          {...props}
          onClick={handleClick}
          aria-invalid={!!error}
          aria-required={required}
        />
        {rightElement && <span className="absolute inset-y-0 inset-e-3 flex items-center">{rightElement}</span>}
      </span>
    </FieldShell>
  );
}
