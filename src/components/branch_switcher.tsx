import { Store } from 'lucide-react';
import useAuthStore from '../store/auth_store';
import Select from '../ui/select';
import toast from '../utils/toast';
import api from '../config/api';

/** The branch this sign-in works at. A plain name with one branch, or on a terminal (it belongs to one branch). */
export default function BranchSwitcher() {
  const me = useAuthStore((state) => state.me);
  const workplace = me?.workplace;
  if (!workplace) return null;

  if (!workplace.branch) {
    return <p className="px-2 text-sm text-warning-800">None of your branches is open</p>;
  }
  if (workplace.branches.length <= 1 || me.mode === 'pos') {
    return (
      <p className="flex items-center gap-2 px-2 text-sm text-muted">
        <Store size={16} aria-hidden="true" />
        <bdi className="truncate">{workplace.branch.name}</bdi>
      </p>
    );
  }

  return (
    <Select
      aria-label="Working branch"
      value={workplace.branch._id}
      onChange={(event) =>
        api
          .post('/me/branch', { branchId: event.target.value })
          .then((res) => useAuthStore.getState().setMe(res.data))
          .catch((err) => toast.error(err.response?.data?.message || 'Could not switch branch'))
      }
      options={workplace.branches.map((branch) => ({ value: branch._id, label: branch.name }))}
    />
  );
}
