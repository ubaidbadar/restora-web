import { Undo2 } from 'lucide-react';
import api from '../../config/api';
import Can from '../../components/can';
import type Customer from '../../types/customer';
import type KhataEntry from '../../types/khata_entry';
import AlertModal from '../../ui/alert_modal/modal';
import IconButton from '../../ui/icon_button';
import formatDate from '../../utils/format_date';
import formatRs from '../../utils/format_rs';
import formatTime from '../../utils/format_time';
import getAxiosMessage from '../../utils/get_axios_message';
import khataLabel from '../../utils/khata_label';
import toast from '../../utils/toast';

interface KhataRowProps {
  entry: KhataEntry;
  customerId: string;
  /** Gets the line that takes the payment back, and the customer with the new balance. */
  onReversed: (reversal: KhataEntry, customer: Customer) => void;
}

/** One khata line: what, when and who; + owed in amber, − paid in green; the balance after it. Payments can be taken back. */
export default function KhataRow({ entry, customerId, onReversed }: KhataRowProps) {
  const reverse = () =>
    api
      .post(`/customers/${customerId}/khata/${entry._id}/reverse`)
      .then((res) => {
        const { customer, ...reversal } = res.data;
        onReversed(reversal, customer);
        toast.success('Payment taken back');
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${entry.reversedAt ? 'text-muted line-through' : 'text-ink'}`}>{khataLabel(entry)}</p>
        <p className="text-sm text-muted">
          {formatDate(entry.createdAt)}, {formatTime(entry.createdAt)}
          {entry.by?.name && ` · ${entry.by.name}`}
        </p>
      </div>
      <div className="text-end">
        <p className={`text-sm font-semibold tabular-nums ${entry.amount > 0 ? 'text-warning-800' : 'text-success-700'}`}>
          {entry.amount > 0 ? '+' : '−'}
          {formatRs(Math.abs(entry.amount))}
        </p>
        <p className="text-xs tabular-nums text-muted">Balance {formatRs(entry.balanceAfter)}</p>
      </div>
      {entry.type === 'payment' && !entry.reversedAt && (
        <Can permission="customers:khata">
          <AlertModal
            title="Take back this payment?"
            description={`${formatRs(Math.abs(entry.amount))} goes back on the khata. Use this when a payment was entered by mistake.`}
            confirmText="Take it back"
            cancelText="Keep it"
            onConfirm={reverse}
            component={({ open }) => <IconButton icon={Undo2} aria-label="Take back this payment" onClick={open} />}
          />
        </Can>
      )}
    </li>
  );
}
