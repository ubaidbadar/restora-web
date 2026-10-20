import type KhataEntry from '../types/khata_entry';

/** What a khata line was, in words: "Order #12", "Payment · JazzCash", "Payment taken back". */
export default function khataLabel(entry: KhataEntry) {
  const order = entry.orderToken ? `Order #${entry.orderToken}` : 'An order';
  const labels: Record<KhataEntry['type'], string> = {
    order,
    adjustment: `${order} changed`,
    payment: 'Payment',
    reversal: 'Payment taken back',
    opening: 'Opening balance',
    merge: 'From a merged record',
  };
  return [labels[entry.type], entry.note].filter(Boolean).join(' · ');
}
