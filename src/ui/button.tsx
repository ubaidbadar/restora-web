import { type ElementType } from 'react';
import buttonSizes from '../constants/button_sizes';
import buttonVariants from '../constants/button_variants';
import type ButtonProps from '../types/button_props';

const baseClasses =
  'cursor-pointer text-nowrap rounded-control inline-flex items-center justify-center gap-2 font-medium select-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed aria-busy:cursor-progress';

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export default function Button<T extends ElementType = 'button'>({
  as,
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className = '',
  iconPosition = 'left',
  ...props
}: ButtonProps<T>) {
  const Component: ElementType = as || 'button';
  const iconSize = iconSizes[size];

  return (
    <Component
      className={`${baseClasses} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
      )}
    </Component>
  );
}
