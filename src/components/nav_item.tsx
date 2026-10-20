import { NavLink } from 'react-router';
import type NavLinkItem from '../types/nav_link_item';

interface NavItemProps extends NavLinkItem {
  /** Icon above the label (bottom bar) instead of beside it (sidebar). */
  stacked?: boolean;
}

// The active link is marked three ways, never by color alone: a filled background, a bolder label and an indicator bar.
const layouts = {
  row: {
    base: 'relative min-h-10 gap-3 rounded-control px-3 text-sm',
    active: 'bg-primary-soft font-semibold text-primary before:absolute before:inset-y-2 before:-start-3 before:w-1 before:rounded-e-pill before:bg-primary',
    idle: 'font-medium text-muted hover:bg-hover hover:text-ink',
  },
  stacked: {
    base: 'h-full flex-col justify-center gap-1 text-xs',
    active: 'font-semibold text-primary',
    idle: 'font-medium text-muted hover:text-ink',
  },
};

export default function NavItem({ to, label, icon: Icon, end, stacked = false }: NavItemProps) {
  const layout = stacked ? layouts.stacked : layouts.row;

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `flex items-center -outline-offset-2 transition-colors ${layout.base} ${isActive ? layout.active : layout.idle}`}
    >
      {({ isActive }) => (
        <>
          <span className={stacked ? `grid h-7 w-12 place-items-center rounded-pill transition-colors ${isActive ? 'bg-primary-soft' : ''}` : 'contents'}>
            <Icon size={stacked ? 20 : 18} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}
