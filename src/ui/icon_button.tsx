import type { LucideIcon } from 'lucide-react';
import { type ComponentProps, type ElementType } from 'react';
import { useFormStatus } from 'react-dom';

const baseClasses =
  'cursor-pointer inline-flex items-center justify-center rounded-control transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-primary-soft text-primary hover:bg-primary/15',
  outline: 'bg-surface border border-border-strong text-ink hover:bg-sunken',
  ghost: 'bg-transparent text-muted hover:bg-hover hover:text-ink',
  danger: 'bg-transparent text-danger-700 hover:bg-danger-50',
};

const sizes = {
  sm: 'size-8',
  /** As tall as an input or a button. */
  md: 'size-control',
};

const iconSizes = {
  sm: 16,
  md: 18,
};

type IconButtonBaseProps<T extends ElementType> = {
  as?: T;
  icon: LucideIcon;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  'aria-label': string;
  className?: string;
  loading?: boolean;
};

type IconButtonProps<T extends ElementType = 'button'> = IconButtonBaseProps<T> &
  Omit<ComponentProps<T>, keyof IconButtonBaseProps<T>>;

export default function IconButton<T extends ElementType = 'button'>({
  as,
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  loading = false,
  ...props
}: IconButtonProps<T>) {
  // Native buttons also show as pending while their parent <form> action runs.
  const { pending } = useFormStatus();
  const isPending = loading || ((as === undefined || as === 'button') && pending);
  const isDisabled = disabled || isPending;
  const Component: ElementType = as || 'button';
  const defaultType = as === undefined || as === 'button' ? 'button' : undefined;
  const iconSize = iconSizes[size];

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      type={defaultType}
      disabled={isDisabled}
      aria-busy={isPending ? 'true' : undefined}
      {...props}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </Component>
  );
}
