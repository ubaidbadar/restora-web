import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Actions shown at the end of the row. */
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="mb-5 flex items-end flex-wrap justify-between gap-x-4 gap-y-3 lg:mb-6">
      <div className='grid'>
        <h1 className="truncate h2 text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
