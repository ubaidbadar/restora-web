import { Armchair, CalendarDays, CircleUser, ClipboardList, LayoutDashboard, Settings, Users, UtensilsCrossed } from 'lucide-react';
import type NavLinkItem from '../types/nav_link_item';

/**
 * The app's pages, each for people with its permission. The phone's bottom bar takes the first three someone may open;
 * the rest sit under "More". The sidebar shows them all, without the Account shortcut.
 */
const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true, permission: 'reports:view' },
  { to: '/orders', label: 'Orders', icon: ClipboardList, permission: 'orders:view' },
  { to: '/customers', label: 'Customers', icon: Users, permission: 'customers:view' },
  { to: '/tables', label: 'Tables', icon: Armchair, permission: 'tables:view' },
  { to: '/reservations', label: 'Reservations', icon: CalendarDays, permission: 'reservations:view' },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, permission: 'menu:view' },
  { to: '/settings', label: 'Settings', icon: Settings, webOnly: true },
  { to: '/settings?tab=account', label: 'Account', icon: CircleUser, webOnly: true },
];

export default NAV_LINKS;
