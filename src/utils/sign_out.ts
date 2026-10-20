import authApi from '../config/auth_api';
import useAuthStore from '../store/auth_store';

/** Signs every account out of this browser. Nobody is signed in afterwards: that is known without asking. */
export default function signOut() {
  return authApi
    .post('/sign-out')
    .catch(() => undefined)
    .then(() => useAuthStore.getState().setMe(null));
}
