import { CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import useOutboxStore from '../../store/outbox_store';
import belongsToCurrentWorkplace from '../../utils/belongs_to_current_workplace';
import WaitingCount from './waiting_count';

/**
 * Never claim that offline work is syncing when the current workplace has
 * rejected changes, or when the only pending work belongs to another account.
 */
export default function SyncStatus() {
  const online = useOutboxStore((state) => state.online);
  const currentCount = useOutboxStore((state) => state.items.filter(belongsToCurrentWorkplace).length);
  const otherCount = useOutboxStore((state) => state.items.filter((item) => !belongsToCurrentWorkplace(item)).length);
  const issue = useOutboxStore((state) => state.items.find(belongsToCurrentWorkplace)?.syncIssue);

  if (online && !currentCount && !otherCount) return null;

  if (issue) {
    return (
      <p role="alert" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card bg-warning-50 px-3.5 py-2.5 text-sm text-warning-800">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>Order changes need review and have not been discarded: {issue}.</span>
        <Link className="font-semibold underline" to="/orders">Review orders</Link>
        <WaitingCount />
      </p>
    );
  }
  if (!currentCount && otherCount) {
    return (
      <p role="status" className="mb-4 flex items-center gap-2 rounded-card bg-warning-50 px-3.5 py-2.5 text-sm text-warning-800">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>Unsynced changes belong to a different account, branch or an older app version. They will not be sent from this workplace.</span>
      </p>
    );
  }

  return (
    <p role="status" className={`mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card px-3.5 py-2.5 text-sm ${online ? 'bg-primary-soft text-accent-text' : 'bg-warning-50 text-warning-800'}`}>
      {online ? <RefreshCw size={16} aria-hidden="true" /> : <CloudOff size={16} aria-hidden="true" />}
      <span>{online
        ? 'Sending changes saved for this restaurant and branch.'
        : 'No internet. Changes stay on this device until this restaurant and branch can connect.'}</span>
      <WaitingCount />
      {otherCount > 0 && <span>Other workplaces also have unsynced changes.</span>}
    </p>
  );
}
