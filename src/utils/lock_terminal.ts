import api from '../config/api';
import useAuthStore from '../store/auth_store';

/** Locks this POS terminal: the next person unlocks it with their PIN. */
export default function lockTerminal() {
  return api
    .post('/pos/lock')
    .catch(() => undefined)
    .then(() => useAuthStore.getState().setMe(null, true));
}
