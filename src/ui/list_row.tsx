import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface ListRowProps {
  /** An icon, avatar or logo at the start. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Shown before the chevron, e.g. a "Current" badge. */
  end?: ReactNode;
  /** Opens a page… */
  to?: string;
  /** …or does something. Without either, the row only shows. */
  onClick?: () => void;
  disabled?: boolean;
  /** Controls outside the row's tap area, e.g. a ⋯ menu. */
  actions?: ReactNode;
}

const MAIN = 'flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-start -outline-offset-2';

/**
 * One row of a grouped list (Settings, Restaurants, Accounts): the whole row is the button, with a chevron when it
 * opens something. Rows sit in `<ul className="divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card">`.
 */
export default function ListRow({ leading, title, subtitle, end, to, onClick, disabled = false, actions }: ListRowProps) {
  const content = (
    <>
      {leading && <span className="flex shrink-0 items-center text-muted">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{title}</span>
        {subtitle && <span className="block truncate text-sm text-muted">{subtitle}</span>}
      </span>
      {end}
      {(to || onClick) && !disabled && <ChevronRight aria-hidden className="size-5 shrink-0 text-muted rtl:-scale-x-100" />}
    </>
  );

  return (
    <li className="flex items-center">
      {to && !disabled ? (
        <Link to={to} className={`${MAIN} transition-colors hover:bg-hover`}>
          {content}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} disabled={disabled} className={`${MAIN} cursor-pointer transition-colors hover:bg-hover disabled:cursor-default disabled:hover:bg-transparent`}>
          {content}
        </button>
      ) : (
        <div className={MAIN}>{content}</div>
      )}
      {actions && <div className="flex shrink-0 items-center pe-2">{actions}</div>}
    </li>
  );
}
