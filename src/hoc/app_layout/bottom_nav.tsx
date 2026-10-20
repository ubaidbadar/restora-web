import { Menu } from 'lucide-react';
import { matchPath, useLocation } from 'react-router';
import NavItem from '../../components/nav_item';
import useNavLinks from '../../hooks/useNavLinks';
import NewOrderFab from './new_order_fab';

/** Taking or editing an order is a checkout screen: it keeps the bottom of the screen for its own order bar. */
const FOCUSED = ['/orders/new', '/orders/:id/edit'];

export default function BottomNav() {
  const [first, second, third] = useNavLinks().main;
  const { pathname } = useLocation();
  if (FOCUSED.some((path) => matchPath(path, pathname))) return null;
  return (
    <nav aria-label="Bottom bar" className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      {first ? <NavItem {...first} stacked /> : <span />}
      {second ? <NavItem {...second} stacked /> : <span />}
      <NewOrderFab />
      {third ? <NavItem {...third} stacked /> : <span />}
      <NavItem to="/more" label="More" icon={Menu} stacked />
    </nav>
  );
}
