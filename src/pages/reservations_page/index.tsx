import { CalendarDays } from 'lucide-react';
import Can from '../../components/can';
import api from '../../config/api';
import EmptyState from '../../components/empty_state';
import FormDrawer from '../../components/form_drawer';
import PageHeader from '../../components/page_header';
import ReservationFields from '../../components/reservation_fields';
import SkeletonList from '../../components/skeleton_list';
import useGet from '../../hooks/useGet';
import type Reservation from '../../types/reservation';
import dayKey from '../../utils/day_key';
import pktToIso from '../../utils/pkt_to_iso';
import toast from '../../utils/toast';
import DayBar from './day_bar';
import ReservationRow from './reservation_row';
import reservationSchema from './reservation_schema';
import AddButton from '../../components/add_button';

/** One day's table bookings at the working branch, in time order. The day is the request's own `date` param. */
export default function ReservationsPage() {
  const { data: list = [], loading, options, get, update } = useGet<Reservation[]>('/reservations', { params: { date: dayKey() } });
  const day: string = options.params.date;
  const setDay = (date: string) => get({ params: { date } });
  const reservations = list.filter((reservation) => dayKey(reservation.dateTime) === day).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  const active = reservations.filter((reservation) => reservation.status !== 'cancelled');
  const guests = active.reduce((sum, reservation) => sum + reservation.partySize, 0);

  return (
    <>
      <PageHeader title="Reservations" subtitle="Table bookings at your branch, by day">
        <Can permission="reservations:manage">
          <FormDrawer
            key={day}
            title="New reservation"
            schema={reservationSchema}
            defaultValues={{ date: day, time: '20:00', partySize: 4 }}
            submitLabel="Save reservation"
            onSave={(values) =>
              api
                .post('/reservations', {
                  ...values,
                  dateTime: pktToIso(values.date, values.time),
                })
                .then((res) => {
                  // An existing customer keeps their saved name, so say the name the booking was saved under.
                  toast.success(`Table booked for ${res.data.customer?.name ?? values.name}`);
                  update((current) => (current ? [res.data, ...current] : [res.data]));
                  if (values.date !== day) setDay(values.date);
                })
            }
            fields={(form) => <ReservationFields {...form} />}
            component={({ open }) => <AddButton onClick={open}>Add reservation</AddButton>}
          />
        </Can>
      </PageHeader>
      <DayBar day={day} onDay={setDay} summary={`${active.length} ${active.length === 1 ? 'booking' : 'bookings'}, ${guests} guests`} />
      {loading && <SkeletonList rows={4} />}
      {!loading && reservations.length === 0 && <EmptyState icon={CalendarDays} title="No reservations this day" text="Add one when a guest calls to book a table." />}
      <ul className="flex flex-col gap-2.5">
        {!loading && reservations.map((reservation) => (
          <ReservationRow key={reservation._id} reservation={reservation} onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))} />
        ))}
      </ul>
    </>
  );
}
