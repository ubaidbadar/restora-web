import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import Button from '../../../ui/button';
import getAxiosMessage from '../../../utils/get_axios_message';
import subscribeWebPush from '../../../utils/subscribe_web_push';
import toast from '../../../utils/toast';

/**
 * Alerts in this browser when a guest orders from a table's QR page or calls a waiter, even with Restora closed or in
 * another tab. Per browser: each computer or phone turns them on for itself.
 */
export default function BrowserAlertsCard() {
  const [state, setState] = useState<{ on: boolean; saving: boolean }>({ on: false, saving: false });

  useEffect(() => {
    navigator.serviceWorker
      ?.getRegistration()
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => setState({ on: Boolean(subscription), saving: false }), () => {});
  }, []);

  const turnOn = () => {
    setState({ on: false, saving: true });
    subscribeWebPush()
      .then((problem) => {
        setState({ on: !problem, saving: false });
        if (problem) toast.error(problem);
        else toast.success('Alerts are on in this browser.');
      })
      .catch((err) => {
        setState({ on: false, saving: false });
        toast.error(getAxiosMessage(err));
      });
  };

  const turnOff = async () => {
    setState({ on: true, saving: true });
    const subscription = await (await navigator.serviceWorker?.getRegistration())?.pushManager.getSubscription();
    if (subscription) {
      await api.post('/push-devices/remove', { token: subscription.endpoint }).catch(() => undefined);
      await subscription.unsubscribe();
    }
    setState({ on: false, saving: false });
    toast.success('Alerts are off in this browser.');
  };

  return (
    <SectionCard
      title="Alerts in this browser"
      description={state.on ? 'This browser alerts you to guests’ orders and calls, even when Restora is closed.' : 'Get an alert when a guest orders from a table’s QR code or calls a waiter, even when Restora is closed.'}
      footer={
        state.on ? (
          <Button variant="outline" icon={BellOff} disabled={state.saving} onClick={() => void turnOff()}>Turn off alerts</Button>
        ) : (
          <Button variant="primary" icon={Bell} disabled={state.saving} onClick={turnOn}>Turn on alerts</Button>
        )
      }
    >
      <p className="text-sm text-muted">While Restora is open in front of you, the page chimes instead.</p>
    </SectionCard>
  );
}
