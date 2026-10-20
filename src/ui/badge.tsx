import { type HTMLAttributes } from 'react';

const baseClasses = 'inline-flex items-center gap-1 whitespace-nowrap border px-2 py-0.5 text-xs leading-4 font-medium';

const variants = {
  primary: 'bg-primary-soft text-primary border-primary/15',
  secondary: 'bg-accent-soft text-accent-text border-accent/30',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-800 border-warning-200',
  error: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-info-50 text-info-700 border-info-200',
  neutral: 'bg-sunken text-body border-border',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  pill?: boolean;
}

export default function Badge({
  children,
  variant = 'primary',
  pill = false,
  className = '',
  ...props
}: BadgeProps) {
  const shapeClasses = pill ? 'rounded-pill' : 'rounded-small';

  return (
    <span
      className={`${baseClasses} ${shapeClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
