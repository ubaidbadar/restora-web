import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import BrandMark from '../../components/brand_mark';
import Can from '../../components/can';
import NavItem from '../../components/nav_item';
import useNavLinks from '../../hooks/useNavLinks';
import Button from '../../ui/button';
import UserMenu from './user_menu';
import WorkplaceSwitcher from '../../components/workplace_switcher';

/** Desktop navigation: a quiet white column; the active page is tinted and marked with a bar. The account lives in the user menu at the foot. */
export default function SideNav() {
  const { main, more } = useNavLinks();

  return (
    <aside className="fixed inset-y-0 inset-s-0 hidden w-64 flex-col gap-5 overflow-y-auto border-e border-border bg-surface px-3 py-5 lg:flex">
      <div className="flex flex-col gap-3">
        <WorkplaceSwitcher />
        <Can permission="orders:create">
          <Button as={Link} to="/orders/new" icon={Plus} size="lg" className="w-full" title="New order (N). Press / to search a list." aria-keyshortcuts="N">
            <span className="flex-1 text-start">New order</span>
            <kbd aria-hidden="true" className="rounded-chip bg-on-primary/15 px-1.5 font-sans text-xs font-semibold">N</kbd>
          </Button>
        </Can>
      </div>
      <nav aria-label="Sidebar" className="flex flex-col gap-0.5">
        {[...main, ...more].filter((link) => link.to !== '/settings/account').map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>
      <div className="mt-auto border-t border-border pt-3">
        <UserMenu />
      </div>
    </aside>
  );
}
