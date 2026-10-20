import type { HTMLAttributes, ReactNode } from 'react';

interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function DialogFooter({ children, className = '', ...props }: DialogFooterProps) {
  return (
    <div
      className={`flex shrink-0 flex-wrap justify-end gap-2 border-t border-border bg-surface px-5 py-3 sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
