/** Why an order was cancelled (or a guest's order turned down). `other` comes with a note. */
type CancelReason = 'customer_left' | 'wrong_order' | 'out_of_stock' | 'duplicate' | 'other';

export default CancelReason;
