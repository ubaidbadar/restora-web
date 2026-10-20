import type OutboxItem from './outbox_item';

export default interface OutboxState {
  /** Oldest first: they are sent in the order they were made. */
  items: OutboxItem[];
  /** Offline ids of orders that have reached the server, and the ids the server gave them. */
  savedIds: Record<string, string>;
  online: boolean;
  add: (item: OutboxItem) => void;
  /** Takes a sent (or refused) item out; `savedId` is the server's id for a new order. */
  done: (id: string, savedId?: string) => void;
  /** Changes a waiting item in place, e.g. an order taken offline and edited before it was sent. */
  replace: (id: string, changes: Partial<OutboxItem>) => void;
  setOnline: (online: boolean) => void;
}
