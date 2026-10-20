import type OutboxState from '../types/outbox_state';
import offlineDb from '../utils/offline_db';
import createStore from './create_store';

/**
 * Changes made without internet (new orders, edits, status changes), kept on this device until they reach the server.
 * `utils/sync_outbox` sends them; every change here is saved on the device at once, so closing the app loses nothing.
 */
const useOutboxStore = createStore<OutboxState>((set, get) => ({
  items: [],
  savedIds: {},
  online: navigator.onLine,
  add: (item) => set({ items: [...get().items, item] }),
  done: (id, savedId) => set({ items: get().items.filter((item) => item.id !== id), savedIds: savedId ? { ...get().savedIds, [id]: savedId } : get().savedIds }),
  replace: (id, changes) => set({ items: get().items.map((item) => (item.id === id ? { ...item, ...changes } : item)) }),
  setOnline: (online) => set({ online }),
}));

useOutboxStore.subscribe(() => {
  const { items, savedIds } = useOutboxStore.getState();
  void offlineDb.set('outbox', { items, savedIds });
});

export default useOutboxStore;
