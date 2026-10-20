import BranchSwitcher from '../../components/branch_switcher';
import NavItem from '../../components/nav_item';
import PageHeader from '../../components/page_header';
import RestaurantSwitcher from '../../components/restaurant_switcher';
import UserMenu from '../../hoc/app_layout/user_menu';
import useNavLinks from '../../hooks/useNavLinks';

/** On phones: the restaurant and branch, the pages that do not fit the bottom bar, and the account menu. */
export default function MorePage() {
  const { more } = useNavLinks();

  return (
    <>
      <PageHeader title="More" />
      <div className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-card bg-surface p-3 shadow-card">
          <RestaurantSwitcher />
          <BranchSwitcher />
        </div>
        {more.length > 0 && (
          <nav aria-label="More pages" className="flex flex-col gap-0.5 rounded-card bg-surface p-3 shadow-card">
            {more.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        )}
        <div className="rounded-card bg-surface p-1 shadow-card">
          <UserMenu />
        </div>
      </div>
    </>
  );
}
