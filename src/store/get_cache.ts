import type { AxiosRequestConfig } from 'axios';
import offlineDb from '../utils/offline_db';
import useAuthStore from './auth_store';

// What each address last answered, so a screen opened again (or opened offline) shows it at once.
const entries = new Map<string, unknown>();
const listeners = new Set<(key: string) => void>();
let saveTimer = 0;

/**
 * `useGet`'s answers, kept in memory and on this device. Code outside a screen (the outbox sync) changes an entry with
 * `set`, and every screen showing it updates.
 */
const getCache = {
  /** One entry per person, restaurant, branch, address and params: nothing shows across sign-ins or branches. */
  keyOf(url: string, options: AxiosRequestConfig = {}) {
    const me = useAuthStore.getState().me;
    return JSON.stringify([me?.user?.id, me?.workplace?.restaurant._id, me?.workplace?.branch?._id, options.baseURL, options.url ?? url, options.params]);
  },
  get: (key: string) => entries.get(key),
  set(key: string, value: unknown) {
    entries.set(key, value);
    listeners.forEach((listener) => listener(key));
    // Saved on the device a moment later, once for a burst of changes.
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => void offlineDb.set('get-cache', [...entries]), 500);
  },
  /** Changes one entry from outside a screen, e.g. a synced order replacing its offline copy. */
  update<T>(key: string, updater: (current: T | undefined) => T | undefined) {
    getCache.set(key, updater(entries.get(key) as T | undefined));
  },
  subscribe(listener: (key: string) => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  /** Loads what was saved on the device, before the app first renders. */
  async load() {
    const saved = await offlineDb.get<[string, unknown][]>('get-cache');
    saved?.forEach(([key, value]) => entries.set(key, value));
  },
  /** Forgets everything (signing out): the next person on this device sees none of it. */
  clear() {
    entries.clear();
    void offlineDb.set('get-cache', []);
  },
};

export default getCache;
