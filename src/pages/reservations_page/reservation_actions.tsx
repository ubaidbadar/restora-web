import { Check, Pencil, X } from 'lucide-react';
import api from '../../config/api';
import FormDrawer from '../../components/form_drawer';
import ReservationFields from '../../components/reservation_fields';
import WhatsAppLink from '../../components/whatsapp_link';
import type Reservation from '../../types/reservation';
import AlertModal from '../../ui/alert_modal/modal';
import Button from '../../ui/button';
import IconButton from '../../ui/icon_button';
import dayKey from '../../utils/day_key';
import fillTemplate from '../../utils/fill_template';
import formatDay from '../../utils/format_day';
import formatTime from '../../utils/format_time';
import pktToIso from '../../utils/pkt_to_iso';
import toast from '../../utils/toast';
import reservationEditSchema from './reservation_edit_schema';
import useAuthStore from '../../store/auth_store';
import getAxiosMessage from '../../utils/get_axios_message';

interface ReservationActionsProps {
  reservation: Reservation;
  onSaved: (reservation: Reservation) => void;
}

/** What can be done to a booking that has not been seated or cancelled yet. */
export default function ReservationActions({ reservation, onSaved }: ReservationActionsProps) {
  const workplace = useAuthStore((state) => state.me!.workplace!);
  const name = reservation.customer?.name ?? 'Guest';
  const phone = reservation.customer?.phone;
  const pending = reservation.status === 'pending';
  const message = fillTemplate(workplace.settings.whatsappTemplates.reservation, {
    name,
    date: formatDay(reservation.dateTime),
    time: formatTime(reservation.dateTime),
    party: reservation.partySize,
    restaurant: workplace.restaurant.name,
  });
  // The HH:mm wall-clock time in PKT, for the edit form's time input.
  const editTime = new Date(new Date(reservation.dateTime).getTime() + 5 * 3_600_000).toISOString().slice(11, 16);

  const updateStatus = (status: 'confirmed' | 'seated' | 'cancelled', msg: string) => {
    api
      .patch(`/reservations/${reservation._id}`, { status })
      .then((res) => {
        onSaved(res.data);
        toast.success(msg);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      {pending && phone && <WhatsAppLink phone={phone} message={message}>Confirm on WhatsApp</WhatsAppLink>}
      {pending && (
        <Button variant="outline" icon={Check} onClick={() => updateStatus('confirmed', `${name}'s booking confirmed`)}>
          Mark confirmed
        </Button>
      )}
      <Button variant="outline" onClick={() => updateStatus('seated', `${name} seated`)}>
        Mark seated
      </Button>
      <FormDrawer
        title={`Edit booking for ${name}`}
        schema={reservationEditSchema}
        defaultValues={{ partySize: reservation.partySize, date: dayKey(reservation.dateTime), time: editTime, note: reservation.note ?? '', tableId: reservation.tableId ?? '' }}
        onSave={({ date, time, partySize, note, tableId }) =>
          api
            .patch(`/reservations/${reservation._id}`, {
              partySize,
              note,
              tableId,
              dateTime: pktToIso(date, time),
            })
            .then((res) => {
              onSaved(res.data);
              toast.success(`${name}'s booking moved to ${formatDay(pktToIso(date, time))}, ${formatTime(pktToIso(date, time))}`);
            })
        }
        fields={(form) => <ReservationFields {...form} editing />}
        component={({ open }) => <IconButton icon={Pencil} variant="outline" aria-label={`Edit reservation for ${name}`} onClick={open} />}
      />
      <AlertModal
        title={`Cancel ${name}'s booking?`}
        description={`${reservation.partySize} people at ${formatTime(reservation.dateTime)}. The booking stays on the day as cancelled.`}
        confirmText="Cancel booking"
        cancelText="Keep it"
        onConfirm={() => updateStatus('cancelled', `${name}'s booking cancelled`)}
        component={({ open }) => (
          <IconButton icon={X} variant="outline" aria-label={`Cancel reservation for ${name}`} className="hover:border-danger-300 hover:bg-danger-50 hover:text-danger-700" onClick={open} />
        )}
      />
    </div>
  );
}
