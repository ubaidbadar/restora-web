import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import Button from '../ui/button';
import api from '../config/api';
import subscribeWebPush from '../utils/subscribe_web_push';
import getAxiosMessage from '../utils/get_axios_message';

/** Opt-in browser alerts for staff with access to the current restaurant and branch. */
export default function WhatsAppPushControls() {
  const [status, setStatus] = useState<{
    enabled: boolean; busy: boolean; message: string;
  }>({ enabled: false, busy: true, message: '' });

  useEffect(() => {
    if (!('Notification' in window) || !navigator.serviceWorker || !('PushManager' in window)) {
      setStatus({ enabled: false, busy: false, message: 'This browser does not support web push alerts.' });
      return;
    }
    navigator.serviceWorker.getRegistration()
      .then(async registration => {
        const subscription = await registration?.pushManager.getSubscription();
        setStatus({ enabled: Boolean(subscription && Notification.permission === 'granted'),
          busy: false, message: '' });
      })
      .catch(() => setStatus({ enabled: false, busy: false, message: 'Could not check notification settings.' }));
  }, []);

  const toggle = async () => {
    if (status.busy) return;
    setStatus(current => ({ ...current, busy: true, message: '' }));
    if (!status.enabled) {
      try {
        const error = await subscribeWebPush();
        setStatus({ enabled: !error, busy: false, message: error || 'Restora alerts are on for messages, orders and table calls.' });
      } catch (error) {
        setStatus({ enabled: false, busy: false, message: getAxiosMessage(error) });
      }
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await api.post('/push-devices/remove', { token: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setStatus({ enabled: false, busy: false, message: 'All Restora browser alerts are off on this device.' });
    } catch (error) {
      setStatus({ enabled: true, busy: false, message: getAxiosMessage(error) });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" icon={status.enabled ? BellOff : Bell}
        disabled={status.busy} onClick={() => void toggle()}>
        {status.busy ? 'Checking alerts…' : status.enabled ? 'Turn off all alerts' : 'Enable browser alerts'}
      </Button>
      {status.message && <p role="status" className="text-xs text-muted">{status.message}</p>}
    </div>
  );
}
