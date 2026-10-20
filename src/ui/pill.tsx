import type { ReactNode } from 'react';

const baseClasses =
  'text-xs px-3 py-1.5 rounded-control border transition-colors inline-flex items-center justify-center font-medium';
const activeClasses = 'border-primary bg-primary text-on-primary';
const inactiveClasses = 'border-border-strong bg-surface text-body';

interface PillProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Pill({
  children,
  isActive = false,
  className = '',
  onClick,
}: PillProps) {
  const stateClasses = isActive ? activeClasses : inactiveClasses;
  const interactiveClasses = onClick ? `cursor-pointer ${isActive ? 'hover:bg-primary-hover' : 'hover:bg-sunken hover:text-ink'}` : '';
  const classes = `${baseClasses} ${stateClasses} ${interactiveClasses} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-pressed={isActive}
      >
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
