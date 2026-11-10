import api from '../config/api';

/**
 * Turns on alerts in this browser: asks to show notifications, subscribes to web push with the server's key and saves the
 * subscription for the person and workplace open now. Answers why it could not, or null when alerts are on.
 */
export default async function subscribeWebPush(): Promise<string | null> {
  const registration = await navigator.serviceWorker?.getRegistration();
  if (!registration || !('PushManager' in window) || !('Notification' in window)) return 'This browser cannot show alerts. Install Restora or use Chrome, Edge, Firefox or Safari.';
  if ((await Notification.requestPermission()) !== 'granted') return 'Notifications are blocked for Restora. Allow them in the browser’s site settings.';
  const { publicKey } = (await api.get<{ publicKey: string | null }>('/push-devices/web-key')).data;
  if (!publicKey) return 'Alerts are not set up on the server yet.';
  const subscription = (await registration.pushManager.getSubscription()) ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey }));
  await api.post('/push-devices', { kind: 'web', ...subscription.toJSON() });
  return null;
}
