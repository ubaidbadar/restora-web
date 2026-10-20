import { CloudOff, RefreshCw } from 'lucide-react';
import useOutboxStore from '../../store/outbox_store';
import WaitingCount from './waiting_count';

/**
 * A thin bar above the page: offline (what shows is what this device saved; new orders and status changes wait), or
 * online with changes still being sent. Hidden when online with nothing waiting.
 */
export default function SyncStatus() {
  // One word, so this re-renders only when the bar itself changes (the count has its own component).
  const status = useOutboxStore((state) => (!state.online ? 'offline' : state.items.length ? 'sending' : 'synced'));
  if (status === 'synced') return null;
  const online = status === 'sending';

  return (
    <p role="status" className={`mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card px-3.5 py-2.5 text-sm ${online ? 'bg-primary-soft text-accent-text' : 'bg-warning-50 text-warning-800'}`}>
      {online ? <RefreshCw size={16} aria-hidden="true" /> : <CloudOff size={16} aria-hidden="true" />}
      <span>{online ? 'Back online. Sending what waited.' : 'No internet. You see what this device saved; new orders and changes will be sent when you are back online.'}</span>
      <WaitingCount />
    </p>
  );
}
