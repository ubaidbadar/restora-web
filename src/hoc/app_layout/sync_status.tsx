import { CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../store/auth_store';
import useOutboxStore from '../../store/outbox_store';
import syncOutbox from '../../utils/sync_outbox';
import WaitingCount from './waiting_count';

/** Keep offline orders visible, with an actionable status instead of hiding failed sync. */
export default function SyncStatus() {
  const online = useOutboxStore((state) => state.online);
  const items = useOutboxStore((state) => state.items);
  const me = useAuthStore((state) => state.me);
  const first = items[0];
  const scope = first?.scope;
  const current = me?.workplace;
  const differentWorkplace = !!first && (
    !scope || !current || !me ||
    scope.userId !== me.user.id ||
    scope.restaurantId !== current.restaurant._id ||
    scope.branchId !== (current.branch?._id ?? '')
  );
  const problem = first?.syncIssue;
  if (online && !items.length) return null;
  const warning = Boolean(problem || differentWorkplace);
  const message = differentWorkplace
    ? 'This device has unsent changes from another sign-in or workplace. Return to the original account and branch before syncing. No changes were discarded.'
    : problem
      ? `An unsent change needs review: ${problem}. Edit the queued order to correct it, or retry after fixing the problem.`
      : online
        ? 'Sending queued changes to the server. Keep this page open until they finish.'
        : 'No internet. You see this device’s saved data; new orders and changes will be sent when you reconnect.';
  const Icon = warning ? AlertTriangle : online ? RefreshCw : CloudOff;
  return (
    <div role="status" aria-live="polite" className={`mb-4 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-card px-3.5 py-2.5 text-sm ${warning || !online ? 'bg-warning-50 text-warning-800' : 'bg-primary-soft text-accent-text'}`}>
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      <WaitingCount />
      {problem && !differentWorkplace && (
        <button
          type="button"
          className="rounded-control border border-current px-3 py-1.5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => {
            useOutboxStore.getState().replace(first.id, { syncIssue: undefined });
            void syncOutbox();
          }}
        >
          Retry sync
        </button>
      )}
    </div>
  );
}
