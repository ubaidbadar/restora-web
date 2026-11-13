/** The customer snapshot on an order; walk-in names have no saved customer id or phone. */
export default interface OrderCustomer {
  _id?: string;
  name: string;
  phone?: string;
}
