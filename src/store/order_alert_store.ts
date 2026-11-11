import type OrderAlertState from '../types/order_alert_state';
import createStore from './create_store';

const MUTED_KEY = 'restora-sound-off';

const readMuted = () => {
  try {
    return localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * New orders this device was told about and nobody has looked at yet (`fresh`, shown highlighted on the board), and
 * whether this browser chimes for them. The sound setting is kept per browser; the highlights only until a reload.
 */
const useOrderAlertStore = createStore<OrderAlertState>((set, get) => ({
  fresh: [],
  muted: readMuted(),
  whatsappInbox: { status: 'checking', lastSyncedAt: null, unreadCount: 0 },
  add: (id) => {
    if (!get().fresh.includes(id)) set({ fresh: [...get().fresh, id] });
  },
  seen: (id) => {
    if (get().fresh.includes(id)) set({ fresh: get().fresh.filter((item) => item !== id) });
  },
  setWhatsAppInbox: (patch) => set({ whatsappInbox: { ...get().whatsappInbox, ...patch } }),
  setMuted: (muted) => {
    try {
      localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
    } catch {
      // Private mode: it holds until the page reloads.
    }
    set({ muted });
  },
}));

export default useOrderAlertStore;
