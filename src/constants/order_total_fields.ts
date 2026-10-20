/** The New order fields the totals depend on: watch only these, so typing an address recalculates nothing. */
const ORDER_TOTAL_FIELDS = ['items', 'type', 'paymentMethod', 'paymentStatus', 'discount', 'deliveryFee'] as const;

export default ORDER_TOTAL_FIELDS;
