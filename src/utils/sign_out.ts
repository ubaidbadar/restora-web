import api from '../config/api';
import authApi from '../config/auth_api';
import useAuthStore from '../store/auth_store';

/**
 * Signs every account out of this browser. Nobody is signed in afterwards: that is known without asking. First the
 * browser's alerts are turned off, so the next person here does not get the last one's.
 */
export default async function signOut() {
  const subscription = await (await navigator.serviceWorker?.getRegistration())?.pushManager?.getSubscription().catch(() => null);
  if (subscription) await api.post('/push-devices/remove', { token: subscription.endpoint }).then(() => subscription.unsubscribe(), () => undefined);
  return authApi
    .post('/sign-out')
    .catch(() => undefined)
    .then(() => useAuthStore.getState().setMe(null));
}
