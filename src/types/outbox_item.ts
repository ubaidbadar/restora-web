/** A change made without internet, waiting on this device to be sent (store/outbox_store). */
export default interface OutboxItem {
  /** Made on this device. For a new order it is also the order's `clientId` and its id until it syncs. */
  id: string;
  /** `put` is an edit of an order's dishes, type, table or customer. */
  method: 'post' | 'patch' | 'put';
  /** May name an order by its offline id; the sync swaps in the server's id once that order is saved. */
  url: string;
  body?: unknown;
  /** What the person is told if the server refuses it, e.g. "Order A-3". */
  label: string;
  createdAt: string;
  /** A new order as the board shows it until it syncs; for an edit, the fields it changes. */
  preview?: unknown;
  /** Explicit before/after diff for offline history inspection and timeline rendering. */
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
}
