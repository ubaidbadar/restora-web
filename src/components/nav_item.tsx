import { NavLink } from 'react-router';
import type NavLinkItem from '../types/nav_link_item';
import useOrderAlertStore from '../store/order_alert_store';

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
  const unread = useOrderAlertStore(state => to === '/whatsapp' ? state.whatsappInbox.unreadCount : 0);

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `flex items-center -outline-offset-2 transition-colors ${layout.base} ${isActive ? layout.active : layout.idle}`}
    >
      {({ isActive }) => (
        <>
          <span className={stacked ? `relative grid h-7 w-12 place-items-center rounded-pill transition-colors ${isActive ? 'bg-primary-soft' : ''}` : 'contents'}>
            <Icon size={stacked ? 20 : 18} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
            {stacked && unread > 0 && <span aria-label={`${unread} unread WhatsApp conversations`}
              className="absolute -top-1 end-1 rounded-pill bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary">
              {unread > 99 ? '99+' : unread}
            </span>}
          </span>
          {label}
          {!stacked && unread > 0 && <span aria-label={`${unread} unread WhatsApp conversations`}
            className="ms-auto rounded-pill bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
            {unread > 99 ? '99+' : unread}
          </span>}
        </>
      )}
    </NavLink>
  );
}
