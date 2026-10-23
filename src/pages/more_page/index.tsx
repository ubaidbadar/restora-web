import BranchSwitcher from '../../components/branch_switcher';
import PageHeader from '../../components/page_header';
import RestaurantSwitcher from '../../components/restaurant_switcher';
import UserMenu from '../../hoc/app_layout/user_menu';
import useNavLinks from '../../hooks/useNavLinks';
import MoreLink from './more_link';

/**
 * On phones: who is signed in (their account menu), the restaurant and branch, then the pages that do not fit the
 * bottom bar, as one list. Every card has the same padding, so the rows line up.
 */
export default function MorePage() {
  const { more } = useNavLinks();

  return (
    <>
      <PageHeader title="More" />
      <div className="flex max-w-md flex-col gap-4">
        <div className="overflow-hidden rounded-card bg-surface p-2 shadow-card">
          <UserMenu />
        </div>
        <section aria-label="Restaurant and branch" className="flex flex-col gap-2 rounded-card bg-surface px-2 py-4 shadow-card">
          <RestaurantSwitcher />
          <BranchSwitcher />
        </section>
        {more.length > 0 && (
          <nav aria-label="More pages" className="overflow-hidden rounded-card bg-surface shadow-card">
            <ul className="divide-y divide-border">
              {more.map((link) => (
                <li key={link.to}>
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
