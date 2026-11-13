import { Minus, Plus } from 'lucide-react';
import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type LineChange from '../../types/line_change';
import type OrderType from '../../types/order_type';
import formatRs from '../../utils/format_rs';

/** The facts an edit can change, in the order shown, with how each reads. */
const FIELDS: { key: string; label: string; show: (value: unknown) => string }[] = [
  { key: 'type', label: 'Order type', show: (value) => ORDER_TYPE_LABELS[value as OrderType] },
  { key: 'tableName', label: 'Table', show: String },
  { key: 'customer', label: 'Customer', show: String },
  { key: 'area', label: 'Area', show: String },
  { key: 'address', label: 'Address', show: String },
  { key: 'rider', label: 'Rider', show: String },
  { key: 'discount', label: 'Discount', show: (value) => formatRs(Number(value)) },
  { key: 'serviceCharge', label: 'Service charge', show: (value) => formatRs(Number(value)) },
  { key: 'deliveryFee', label: 'Delivery', show: (value) => formatRs(Number(value)) },
  { key: 'total', label: 'Total', show: (value) => formatRs(Number(value)) },
];

interface ChangeListProps {
  lines: LineChange[];
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

const shown = (field: (typeof FIELDS)[number], value: unknown) => (value === null || value === undefined || value === '' ? 'none' : field.show(value));

/** What one edit changed: dishes added (+), removed (−) or recounted, then each detail from → to. */
export default function ChangeList({ lines, before, after }: ChangeListProps) {
  const fields = FIELDS.filter((field) => field.key in after);
  return (
    <ul className="mt-1 flex flex-col gap-1.5 rounded-control bg-sunken px-3 py-2.5">
      {lines.map((line, index) => {
        const added = line.was === 0;
        const removed = line.now === 0;
        return (
          <li key={index} className="flex items-start gap-2">
            {added || removed ? (
              <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-pill ${added ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                {added ? <Plus aria-label="Added" className="size-3" strokeWidth={3} /> : <Minus aria-label="Removed" className="size-3" strokeWidth={3} />}
              </span>
            ) : (
              <span aria-hidden className="size-4 shrink-0" />
            )}
            <span dir="auto" className="min-w-0 grow">
              <span className={removed ? 'text-muted line-through decoration-danger-500' : 'text-ink'}>
                {added || removed ? `${added ? line.now : line.was} × ` : ''}
                {line.name}
              </span>
              {line.detail && <span className="block text-xs text-muted">{line.detail}</span>}
              {line.wasPrice !== undefined && line.nowPrice !== undefined && line.wasPrice !== line.nowPrice && <span className="block text-xs text-muted">Unit price: {formatRs(line.wasPrice)} → {formatRs(line.nowPrice)}</span>}
            </span>
            {!added && !removed && line.was !== line.now && (
              <span className="shrink-0 text-ink tabular-nums">
                <span className="text-muted">{line.was} →</span> {line.now}
              </span>
            )}
          </li>
        );
      })}
      {fields.map((field) => (
        <li key={field.key} className={`flex items-start justify-between gap-3 ${field.key === 'total' && lines.length + fields.length > 1 ? 'mt-1 border-t border-border pt-2 font-medium' : ''}`}>
          <span className="text-muted">{field.label}</span>
          <span dir="auto" className="text-end text-ink tabular-nums">
            <span className="text-muted">{shown(field, before[field.key])} →</span> {shown(field, after[field.key])}
          </span>
        </li>
      ))}
    </ul>
  );
}
