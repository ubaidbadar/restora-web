import { Users } from 'lucide-react';
import RESERVATION_STATUS_LABELS from '../../constants/reservation_status_labels';
import type Reservation from '../../types/reservation';
import Badge from '../../ui/badge';
import formatTime from '../../utils/format_time';
import ReservationActions from './reservation_actions';

interface ReservationRowProps {
  reservation: Reservation;
  onSaved: (reservation: Reservation) => void;
}

const badges = { pending: 'warning', confirmed: 'success', seated: 'neutral', cancelled: 'error' } as const;

export default function ReservationRow({ reservation, onSaved }: ReservationRowProps) {
  const name = reservation.customer?.name ?? 'Guest';
  const open = reservation.status === 'pending' || reservation.status === 'confirmed';

  return (
    <li className="flex flex-col gap-3 rounded-card bg-surface p-3.5 shadow-card md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <p className="w-20 shrink-0 border-e border-border pe-3 text-heading whitespace-nowrap tabular-nums text-ink">{formatTime(reservation.dateTime)}</p>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink"><bdi>{name}</bdi></p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1 tabular-nums"><Users size={15} aria-hidden="true" />{reservation.partySize} people</span>
            <Badge variant={badges[reservation.status]}>{RESERVATION_STATUS_LABELS[reservation.status]}</Badge>
          </p>
          {reservation.note && <p dir="auto" className="mt-1.5 text-sm text-body">{reservation.note}</p>}
        </div>
      </div>
      {open && <ReservationActions reservation={reservation} onSaved={onSaved} />}
    </li>
  );
}
