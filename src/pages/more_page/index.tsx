import BranchSwitcher from '../../components/branch_switcher';
import PageHeader from '../../components/page_header';
import RestaurantSwitcher from '../../components/restaurant_switcher';
import UserMenu from '../../hoc/app_layout/user_menu';
import useNavLinks from '../../hooks/useNavLinks';
import MoreLink from './more_link';

/**
 * On phones: who is signed in (their account menu), the restaurant and branch, then the pages that do not fit the
 * bottom bar, as one list. Every card has the same padding, so the rows line up. On tablets the page uses the full
 * width: account and restaurant side by side, and each page its own card in a grid.
 */
export default function MorePage() {
  const { more } = useNavLinks();

  return (
    <>
      <PageHeader title="More" />
      <div className="flex w-full max-w-md flex-col gap-4 md:max-w-none">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center overflow-hidden rounded-card bg-surface p-2 shadow-card">
            <UserMenu />
          </div>
          <section aria-label="Restaurant and branch" className="flex flex-col gap-2 rounded-card bg-surface px-2 py-4 shadow-card">
            <RestaurantSwitcher />
            <BranchSwitcher />
          </section>
        </div>
        {more.length > 0 && (
          <nav aria-label="More pages" className="overflow-hidden rounded-card bg-surface shadow-card md:overflow-visible md:rounded-none md:bg-transparent md:shadow-none">
            <ul className="divide-y divide-border md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 lg:grid-cols-3">
              {more.map((link) => (
                <li key={link.to} className="md:overflow-hidden md:rounded-card md:bg-surface md:shadow-card">
                  <MoreLink {...link} />
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
