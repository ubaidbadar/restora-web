import ORDER_TYPE_LABELS from './order_type_labels';
import type OrderType from '../types/order_type';

/** The order type filter: every type, or one. */
const ORDER_TYPE_OPTIONS = [
  { value: 'all' as OrderType | 'all', label: 'All types' },
  ...(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((value) => ({ value: value as OrderType | 'all', label: ORDER_TYPE_LABELS[value] })),
];

export default ORDER_TYPE_OPTIONS;
