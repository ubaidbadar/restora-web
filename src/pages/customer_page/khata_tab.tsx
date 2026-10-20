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
}

/** Every credit and payment, newest first, with the balance after each. */
export default function KhataTab({ customer }: KhataTabProps) {
  const { data: entries = [], loading } = useGet<KhataEntry[]>(`/customers/${customer._id}/khata`);
  if (loading) return <SkeletonList rows={4} />;
  if (entries.length === 0) return <EmptyState icon={NotebookText} title="No khata yet" text="Orders put on khata and payments received will show here." />;
  return (
    <div className="flex flex-col gap-3">
      <KhataShare customer={customer} entries={entries} />
      <ul className="divide-y divide-border rounded-card bg-surface px-4 shadow-card">
        {entries.map((entry) => (
          <KhataRow key={entry._id} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
