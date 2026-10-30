import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import BrandMark from '../../components/brand_mark';
import BranchSwitcher from '../../components/branch_switcher';
import Can from '../../components/can';
import NavItem from '../../components/nav_item';
import RestaurantSwitcher from '../../components/restaurant_switcher';
import useNavLinks from '../../hooks/useNavLinks';
import Button from '../../ui/button';
import UserMenu from './user_menu';

/** Desktop navigation: a quiet white column; the active page is tinted and marked with a bar. The account lives in the user menu at the foot. */
export default function SideNav() {
  const { main, more } = useNavLinks();

  return (
    <aside className="fixed inset-y-0 inset-s-0 hidden w-64 flex-col gap-5 overflow-y-auto border-e border-border bg-surface px-3 py-5 lg:flex">
      <Link to="/" aria-label="Restora, home" className="self-start rounded-control px-2 py-1 -outline-offset-2">
        <BrandMark />
      </Link>
      <div className="flex flex-col gap-2">
        <RestaurantSwitcher />
        <BranchSwitcher />
        <Can permission="orders:create">
          <Button as={Link} to="/orders/new" icon={Plus} size="lg" className="w-full">
            New order
          </Button>
        </Can>
      </div>
      <nav aria-label="Sidebar" className="flex flex-col gap-0.5 border-t border-border pt-4">
        {[...main, ...more].filter((link) => link.to !== '/settings/account').map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <p className="px-3 text-xs leading-5 text-muted">
          Press <kbd className="rounded-chip border border-border px-1 font-sans font-semibold text-ink">N</kbd> for a new order,{' '}
          <kbd className="rounded-chip border border-border px-1 font-sans font-semibold text-ink">/</kbd> to search.
        </p>
        <div className="border-t border-border pt-3">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
