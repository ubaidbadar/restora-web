/** Customer details frozen on an order; walk-in names have no saved customer id or phone. */
export default interface OrderCustomerSnapshot {
  _id?: string;
  name: string;
  phone?: string;
}
