import useOrderAlertStore from '../../store/order_alert_store';

export default function WhatsAppLiveStatus() {
  const inbox = useOrderAlertStore(state => state.whatsappInbox);
  const updated = inbox.lastSyncedAt
    ? new Date(inbox.lastSyncedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;
  const label = inbox.status === 'live' ? 'Live' :
    inbox.status === 'offline' ? 'Offline' :
    inbox.status === 'paused' ? 'Paused' : 'Connecting';

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-xs text-muted">
      <span className={`size-2 rounded-full ${inbox.status === 'live' ? 'bg-primary' : 'bg-muted'}`} />
      <span className="font-semibold text-ink">{label}</span>
      {updated && <span>· Updated {updated}</span>}
      {inbox.status === 'paused' && <span>· Waiting for this tab</span>}
    </div>
  );
}
