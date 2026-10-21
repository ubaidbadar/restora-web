import axios from 'axios';
import apiOrigin from '../constants/api_origin';
import useAuthStore from '../store/auth_store';

/** The app's API. The server takes the restaurant and branch from the sign-in, so requests never send them. */
const api = axios.create({ baseURL: `${apiOrigin}/api/v1`, withCredentials: true });

// A host that is not the API (e.g. the hosting's page for every path) answers HTML: that is an error, never data.
api.interceptors.response.use((res) => {
  if (typeof res.data === 'string' && /^\s*</.test(res.data)) {
    return Promise.reject(new Error('The API answered with a page instead of data. Check VITE_API_URL at build time.'));
  }
  return res;
});

api.interceptors.response.use(undefined, (error) => {
  const status = error.response?.status;
  const data = error.response?.data;
  // Signed out, or a terminal that locked itself: the route guards send them to sign in or to the lock screen.
  if (status === 401 && (data?.code === 'signed_out' || data?.code === 'pos_locked')) {
    useAuthStore.getState().setMe(null, data.code === 'pos_locked');
  }
  // Removed, suspended, or the restaurant is closing: the answer carries where they work now.
  if (status === 403 && data?.code === 'context_lost') useAuthStore.getState().setMe(data.me);
  return Promise.reject(error);
});

export default api;
