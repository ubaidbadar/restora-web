import api from '../../config/api';
import type Customer from '../../types/customer';
import AlertModal from '../../ui/alert_modal/modal';
import Button from '../../ui/button';
import formatPhone from '../../utils/format_phone';
import formatRs from '../../utils/format_rs';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';

interface MergeResultsProps {
  /** The customers the search found, this one left out. */
  found: Customer[];
  keep: Customer;
  onMerged: (customer: Customer) => void;
}

/** Customers matching the search, each with what moving it would bring. */
export default function MergeResults({ found, keep, onMerged }: MergeResultsProps) {
  if (!found.length) return <p className="text-sm text-muted">Nobody else matches.</p>;

  const merge = (other: Customer) => {
    api
      .post(`/customers/${keep._id}/merge`, { customerId: other._id })
      .then((res) => {
        toast.success(`${other.name} merged into ${keep.name}`);
        onMerged(res.data);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <ul className="divide-y divide-border rounded-control border border-border">
      {found.slice(0, 10).map((other) => (
        <li key={other._id} className="flex items-center gap-3 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{other.name}</p>
            <p className="text-sm tabular-nums text-muted">
              {formatPhone(other.phone)} · {other.orderCount} orders{other.khataBalance ? ` · khata ${formatRs(other.khataBalance)}` : ''}
            </p>
          </div>
          <AlertModal
            title={`Merge ${other.name} into ${keep.name}?`}
            description={`${other.orderCount} orders, bookings and khata move to ${keep.name}. ${other.name}'s record is deleted; this can't be undone.`}
            confirmText="Merge"
            cancelText="Cancel"
            onConfirm={() => merge(other)}
            component={({ open }) => (
              <Button size="sm" variant="outline" onClick={open}>
                Merge
              </Button>
            )}
          />
        </li>
      ))}
    </ul>
  );
}
