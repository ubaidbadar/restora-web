import type Customer from './customer';

/** The few customer fields that come along with an order or a reservation. */
type OrderCustomer = Pick<Customer, '_id' | 'name' | 'phone'>;

export default OrderCustomer;
