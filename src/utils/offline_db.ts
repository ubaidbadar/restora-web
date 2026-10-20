/**
 * A small key-value store on this device (IndexedDB), for what must survive without internet: the last `/me`, the
 * answers `useGet` has seen, and the outbox of changes waiting to be sent. Every call resolves, never rejects: when the
 * browser refuses storage (private mode), the app simply works online only.
 */
const open = () =>
  new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = indexedDB.open('restora', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('kv');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

let db: Promise<IDBDatabase | null> | undefined;

const run = <T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest) =>
  (db ??= open()).then(
    (database) =>
      new Promise<T | undefined>((resolve) => {
        if (!database) return resolve(undefined);
        try {
          const request = work(database.transaction('kv', mode).objectStore('kv'));
          request.onsuccess = () => resolve(request.result as T);
          request.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      })
  );

const offlineDb = {
  get: <T>(key: string) => run<T>('readonly', (store) => store.get(key)),
  set: (key: string, value: unknown) => run('readwrite', (store) => store.put(value, key)),
  clear: () => run('readwrite', (store) => store.clear()),
};

export default offlineDb;
