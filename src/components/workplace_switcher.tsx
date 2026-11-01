import { ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import useAuthStore from '../store/auth_store';
import Avatar from '../ui/avatar';
import DropdownMenu from '../ui/dropdown_menu';
import initialsOf from '../utils/initials_of';
import toast from '../utils/toast';
import api from '../config/api';

/**
 * The restaurant and branch this sign-in works at, as one quiet block: the restaurant on top, the branch smaller below
 * (hidden when there is only one). One menu switches both. Plain text when there is nothing to switch, or on a terminal.
 */
export default function WorkplaceSwitcher() {
  const navigate = useNavigate();
  const me = useAuthStore((state) => state.me);
  const workplace = me?.workplace;
  if (!workplace) return null;
  const { restaurant, branch, branches } = workplace;
  // Suspended ones and those being deleted cannot be opened.
  const restaurants = me.restaurants.filter((r) => !r.status);
  const terminal = me.mode === 'pos';

  const switchTo = (path: string, body: object, failed: string) =>
    api
      .post(path, body)
      .then((res) => useAuthStore.getState().setMe(res.data))
      .catch((err) => toast.error(err.response?.data?.message || failed));

  const items = [
    ...(restaurants.length > 1
      ? restaurants.map((r) => ({
        section: 'Restaurants',
        label: r.name,
        leading: <Avatar src={r.logo} initials={initialsOf(r.name)} alt="" size="xs" square />,
        selected: r._id === restaurant._id,
        onClick: () =>
          r._id !== restaurant._id &&
          switchTo('/me/workplace', { restaurantId: r._id }, 'Could not switch restaurant').then(() => navigate('/', { replace: true })),
      }))
      : []),
    ...(branches.length > 1
      ? branches.map((b) => ({
        section: 'Branches',
        label: b.name,
        selected: b._id === branch?._id,
        onClick: () => b._id !== branch?._id && switchTo('/me/branch', { branchId: b._id }, 'Could not switch branch'),
      }))
      : []),
  ];

  const label = (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <Avatar src={restaurant.logo} initials={initialsOf(restaurant.name)} alt="" size="sm" square />
      <span className="min-w-0 flex-1">
        <bdi className="line-clamp-2 text-sm font-semibold break-words text-ink">{restaurant.name}</bdi>
        {!branch ? (
          <span className="block truncate text-xs text-warning-800">No branch open</span>
        ) : (
          (branches.length > 1 || terminal) && <bdi className="block truncate text-xs text-muted">{branch.name}</bdi>
        )}
      </span>
    </span>
  );

  if (terminal || !items.length) return <div className="flex px-2 py-1.5">{label}</div>;

  return (
    <DropdownMenu
      align="left"
      className="w-full mb-6"
      menuClassName="w-64"
      items={items}
      trigger={(isOpen) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title={`${restaurant.name}${branch ? ` · ${branch.name}` : ''}`}
          aria-label={`Switch restaurant or branch, now ${restaurant.name}${branch ? `, ${branch.name}` : ''}`}
          className={`flex w-full cursor-pointer items-center gap-1 rounded-control py-1.5 ps-2 pe-1.5 text-start transition-colors -outline-offset-2 hover:bg-hover ${isOpen ? 'bg-hover' : ''}`}
        >
          {label}
          <ChevronsUpDown size={16} className="shrink-0 text-muted" aria-hidden="true" />
        </button>
      )}
    />
  );
}
