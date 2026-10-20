import type Table from './table';

/** `GET /tables/floor`: a table with what is going on at it now. */
export default interface FloorTable extends Table {
  /** Today's dine-in orders at it that are not finished (or finished but not paid). */
  orders: { _id: string; dailyToken: number; total: number; status: string; paymentStatus: string; createdAt: string }[];
  /** Open guest calls from the QR menu. */
  requests: { _id: string; type: 'waiter' | 'bill'; createdAt: string }[];
  /** A booking for it from half an hour ago to an hour and a half from now. */
  booking: { _id: string; dateTime: string; partySize: number } | null;
}
