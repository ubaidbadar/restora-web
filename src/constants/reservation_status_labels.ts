import type ReservationStatus from '../types/reservation_status';

const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Not confirmed',
  confirmed: 'Confirmed',
  seated: 'Seated',
  cancelled: 'Cancelled',
};

export default RESERVATION_STATUS_LABELS;
