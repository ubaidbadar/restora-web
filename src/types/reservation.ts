import type OrderCustomer from './order_customer';
import type ReservationStatus from './reservation_status';

export default interface Reservation {
  _id: string;
  branchId: string;
  customerId: string;
  /** Name and phone of the guest, sent with list responses. */
  customer?: OrderCustomer;
  partySize: number;
  dateTime: string;
  status: ReservationStatus;
  /** The table kept for the guests. */
  tableId?: string;
  /** Free text, e.g. "Rs 5,000 advance paid by JazzCash". */
  note?: string;
}
