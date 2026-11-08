import type OutboxState from '../types/outbox_state';
import offlineDb from '../utils/offline_db';
import createStore from './create_store';
import useAuthStore from './auth_store';

/**
 * Changes made without internet (new orders, edits, status changes), kept on this device until they reach the server.
 * `utils/sync_outbox` sends them; every change here is saved on the device at once, so closing the app loses nothing.
 */
const useOutboxStore = createStore<OutboxState>((set, get) => ({
  items: [],
  savedIds: {},
  online: navigator.onLine,
  add: (item) => {
    const me = useAuthStore.getState().me;
    const workplace = me?.workplace;
    const scope = me?.user?.id && workplace?.restaurant?._id
      ? { userId: me.user.id, restaurantId: workplace.restaurant._id, branchId: workplace.branch?._id ?? '' }
      : undefined;
    set({ items: [...get().items, { ...item, scope }] });
  },
  done: (id, savedId) => set({ items: get().items.filter((item) => item.id !== id), savedIds: savedId ? { ...get().savedIds, [id]: savedId } : get().savedIds }),
  replace: (id, changes) => set({
    items: get().items.map((item) => item.id === id
      ? { ...item, ...changes, ...(changes.body !== undefined ? { syncIssue: undefined } : {}) }
      : item),
  }),
  setOnline: (online) => set({ online }),
}));

useOutboxStore.subscribe(() => {
  const { items, savedIds } = useOutboxStore.getState();
  void offlineDb.set('outbox', { items, savedIds });
});

export default useOutboxStore;
