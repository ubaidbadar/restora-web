import type LineChange from '../types/line_change';
import type Order from '../types/order';
import type OrderItem from '../types/order_item';

const FIELDS = ['type', 'tableName', 'customer', 'area', 'address', 'rider', 'discount', 'deliveryFee', 'total'] as const;
type Field = (typeof FIELDS)[number];
type Snapshot = Partial<Order>;

const lineKey = (item: OrderItem) => [item.itemId, item.sizeId ?? '', [...(item.addonIds ?? [])].sort().join(','), item.note ?? ''].join('|');

const lineDetail = (item: OrderItem) =>
  [item.sizeName, item.addons?.map((addon) => addon.name).join(', '), item.note && `“${item.note}”`].filter(Boolean).join(' · ') || undefined;

export function lineChanges(before: OrderItem[], after: OrderItem[]): LineChange[] {
  const count = (items: OrderItem[]) => {
    const lines = new Map<string, { item: OrderItem; qty: number }>();
    for (const item of items) {
      const line = lines.get(lineKey(item));
      if (line) line.qty += item.qty;
      else lines.set(lineKey(item), { item, qty: item.qty });
    }
    return lines;
  };
  const was = count(before);
  const now = count(after);
  const changes: LineChange[] = [];
  for (const [key, { item, qty }] of was) {
    const left = now.get(key)?.qty ?? 0;
    if (left !== qty) changes.push({ name: item.name, detail: lineDetail(item), was: qty, now: left });
  }
  for (const [key, { item, qty }] of now) {
    if (!was.has(key)) changes.push({ name: item.name, detail: lineDetail(item), was: 0, now: qty });
  }
  return changes.sort((a, b) => Number(a.now > 0) - Number(b.now > 0));
}

const AMOUNTS: Field[] = ['discount', 'deliveryFee', 'total'];
const value = (order: Snapshot, field: Field) => {
  if (field === 'customer') return order.customer?.name || undefined;
  return AMOUNTS.includes(field) ? (order[field] ?? 0) : order[field] || undefined;
};

export default function orderChanges(before: Snapshot, after: Snapshot) {
  const was: Record<string, unknown> = {};
  const now: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const a = value(before, field);
    const b = value(after, field);
    if (a !== b) {
      was[field] = a ?? null;
      now[field] = b ?? null;
    }
  }
  if (before.items && after.items) {
    const lines = lineChanges(before.items, after.items);
    if (lines.length) now.lines = lines;
  }
  return Object.keys(now).length ? { before: was, after: now } : undefined;
}
