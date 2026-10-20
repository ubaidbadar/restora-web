import reservationSchema from './reservation_schema';

/** Editing changes the booking itself; the guest stays the same. */
const reservationEditSchema = reservationSchema.omit({ phone: true, name: true });

export default reservationEditSchema;
