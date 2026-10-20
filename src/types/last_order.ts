import type Order from './order';

/** The part of an order kept on the customer so "Repeat last order" works from the cache. */
type LastOrder = Pick<Order, 'items' | 'type' | 'paymentMethod' | 'total' | 'area' | 'address'>;

export default LastOrder;
