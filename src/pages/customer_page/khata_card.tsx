import api from '../../config/api';
import Can from '../../components/can';
import FormDrawer from '../../components/form_drawer';
import getCache from '../../store/get_cache';
import type Customer from '../../types/customer';
import type KhataEntry from '../../types/khata_entry';
import Button from '../../ui/button';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import formatRs from '../../utils/format_rs';
import toast from '../../utils/toast';
import paymentSchema from './payment_schema';

interface KhataCardProps {
  customer: Customer;
  /** Gets the customer with the new balance after a payment. */
  onSaved: (customer: Customer) => void;
}

export default function KhataCard({ customer, onSaved }: KhataCardProps) {
  const owes = customer.khataBalance > 0;

  return (
    // A slim bar under the numbers: loud only when the customer owes something.
    <div className={`mt-3 mb-4 flex items-center justify-between gap-3 rounded-card lg:mb-5 py-2 ps-4 pe-2 sm:ps-5 ${owes ? 'border border-warning-200 bg-warning-50' : 'bg-surface shadow-card'}`}>
      <p className="min-w-0 text-sm">
        <span className="text-muted">Khata · </span>
        {owes ? (
          <span className="font-semibold tabular-nums text-warning-800">{formatRs(customer.khataBalance)} due</span>
        ) : (
          <span className="text-body">{customer.khataBalance < 0 ? `${formatRs(-customer.khataBalance)} paid in advance` : 'Nothing due'}</span>
        )}
      </p>
      <Can permission="customers:khata">
        <FormDrawer
          title={`Payment from ${customer.name}`}
          schema={paymentSchema}
          defaultValues={{ amount: owes ? customer.khataBalance : '' }}
          submitLabel="Record payment"
          onSave={(values) =>
            api
              .post(`/customers/${customer._id}/khata`, {
                type: 'payment',
                amount: Number(values.amount),
                note: values.note,
              })
              .then((res) => {
                const { customer: saved, ...entry } = res.data;
                toast.success(`${formatRs(Number(values.amount))} received from ${customer.name}`);
                // The Khata tab shows the payment at once, on top, without loading the list again.
                getCache.update<KhataEntry[]>(getCache.keyOf(`/customers/${customer._id}/khata`), (list) => (list ? [entry, ...list] : list));
                onSaved(saved ?? { ...customer, khataBalance: customer.khataBalance - Number(values.amount) });
              })
          }
          fields={({ register, errors }) => (
            <>
              <Input label="Amount received (Rs)" inputMode="numeric" autoFocus required {...register('amount')} error={fieldError(errors, 'amount')} />
              <Input label="Note (optional)" dir="auto" placeholder="e.g. JazzCash, cash at counter" {...register('note')} error={fieldError(errors, 'note')} />
            </>
          )}
          component={({ open }) => <Button variant={owes ? 'primary' : 'ghost'} className="min-h-11 shrink-0" onClick={open}>Record payment</Button>}
        />
      </Can>
    </div>
  );
}
