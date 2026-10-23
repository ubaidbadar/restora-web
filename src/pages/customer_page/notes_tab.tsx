import api from '../../config/api';
import useCan from '../../hooks/useCan';
import type Customer from '../../types/customer';
import Button from '../../ui/button';
import Form from '../../ui/form';
import Textarea from '../../ui/textarea';
import notesSchema from './notes_schema';

interface NotesTabProps {
  customer: Customer;
  /** Gets the customer with the saved notes. */
  onCustomer: (customer: Customer) => void;
}

/** What staff should remember about the customer. Saved to their record; read-only for people who can't edit customers. */
export default function NotesTab({ customer, onCustomer }: NotesTabProps) {
  const canEdit = useCan('customers:manage');

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <Form
        schema={notesSchema}
        defaultValues={{ notes: customer.notes ?? '' }}
        className="flex flex-col gap-3"
        onSubmit={({ data, onSuccess, onError }) => {
          api
            .patch(`/customers/${customer._id}`, { notes: data.notes ?? '' })
            .then((res) => {
              onSuccess('Saved');
              onCustomer(res.data);
            })
            .catch(onError);
        }}
        component={({ register, loading, message }) => (
          <>
            <Textarea label="Notes" dir="auto" rows={4} readOnly={!canEdit} placeholder="Allergies, favourite table, how they like their karahi…" {...register('notes')} />
            {canEdit && (
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading}>Save notes</Button>
                <span role="status" className="text-sm font-medium text-success-700">{message}</span>
              </div>
            )}
          </>
        )}
      />
      {Boolean(customer.addresses?.length) && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Addresses</h2>
          <ul className="flex flex-col divide-y divide-border rounded-card bg-surface px-4 text-sm text-body shadow-card [&>li]:py-2.5">
            {customer.addresses?.map((address) => <li key={address} dir="auto">{address}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
