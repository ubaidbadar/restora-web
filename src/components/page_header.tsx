import { type ReactNode } from 'react';
import BackButton from './back_button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Actions shown at the end of the row. */
  children?: ReactNode;
  backTo?: string;
}

export default function PageHeader({ title, subtitle, children, backTo }: PageHeaderProps) {
  return (
    <header className="mb-5 flex items-end justify-between gap-x-3 gap-y-3 lg:mb-6">
      {backTo && <BackButton className='mb-auto -mt-2.25 -ml-4 -mr-4' iconOnly to={backTo} />}
      <div className='grid'>
        <h1 className="truncate h2 text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm truncate text-ink text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
