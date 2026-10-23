import { NotebookText } from 'lucide-react';
import EmptyState from '../../components/empty_state';
import SkeletonList from '../../components/skeleton_list';
import useGet from '../../hooks/useGet';
import type Customer from '../../types/customer';
import type KhataEntry from '../../types/khata_entry';
import KhataRow from './khata_row';
import KhataShare from './khata_share';

interface KhataTabProps {
  customer: Customer;
  onCustomer: (customer: Customer) => void;
}

/** Every credit and payment, newest first, with the balance after each. */
export default function KhataTab({ customer, onCustomer }: KhataTabProps) {
  const { data: entries = [], loading, update } = useGet<KhataEntry[]>(`/customers/${customer._id}/khata`);
  // The taken-back payment is marked, and the line that undoes it goes on top (newest first).
  const reversed = (original: KhataEntry) => (reversal: KhataEntry, saved: Customer) => {
    update((list) => [reversal, ...(list ?? []).map((item) => (item._id === original._id ? { ...item, reversedAt: reversal.createdAt } : item))]);
    onCustomer(saved);
  };
  if (loading) return <SkeletonList rows={4} />;
  if (entries.length === 0) return <EmptyState icon={NotebookText} title="No khata yet" text="Orders put on khata and payments received will show here." />;
  return (
    <div className="flex flex-col gap-3">
      <KhataShare customer={customer} entries={entries} />
      <ul className="divide-y divide-border rounded-card bg-surface px-4 shadow-card">
        {entries.map((entry) => (
          <KhataRow key={entry._id} entry={entry} customerId={customer._id} onReversed={reversed(entry)} />
        ))}
      </ul>
    </div>
  );
}
