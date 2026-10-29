import { Menu } from 'lucide-react';
import { matchPath, useLocation } from 'react-router';
import NavItem from '../../components/nav_item';
import useNavLinks from '../../hooks/useNavLinks';
import NewOrderFab from './new_order_fab';

/** Taking or editing an order is a checkout screen: it keeps the bottom of the screen for its own order bar. */
const FOCUSED = ['/orders/new', '/orders/:id/edit'];

/** The bar's top edge, 112px wide, dipping round the "+" (34px around its centre, 2px below the edge) with small rounded shoulders. */
const EDGE = 'M0 0H16.2A6 6 0 0 1 22.17 5.4A34 34 0 0 0 89.83 5.4A6 6 0 0 1 95.8 0H112';

export default function BottomNav() {
  const [first, second, third] = useNavLinks().main;
  const { pathname } = useLocation();
  if (FOCUSED.some((path) => matchPath(path, pathname))) return null;
  return (
    <nav aria-label="Bottom bar" className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {/* The bar's background, cut out in the middle round the "+"; the screen shows through the cut. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 flex">
        <div className="flex-1 border-t border-border bg-surface" />
        <div className="-mx-px flex w-[112px] shrink-0 flex-col">
          <svg width="112" height="64" viewBox="0 0 112 64" className="block shrink-0">
            <g transform="translate(0 .5)">
              <path d={`${EDGE}V64H0Z`} className="fill-surface" />
              <path d={EDGE} className="fill-none stroke-border" />
            </g>
          </svg>
          <div className="flex-1 bg-surface" />
        </div>
        <div className="flex-1 border-t border-border bg-surface" />
      </div>
      {first ? <NavItem {...first} stacked /> : <span />}
      {second ? <NavItem {...second} stacked /> : <span />}
      <NewOrderFab />
      {third ? <NavItem {...third} stacked /> : <span />}
      <NavItem to="/more" label="More" icon={Menu} stacked />
    </nav>
  );
}
