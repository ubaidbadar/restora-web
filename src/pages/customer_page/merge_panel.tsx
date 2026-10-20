import SearchInput from '../../components/search_input';
import useGet from '../../hooks/useGet';
import type Customer from '../../types/customer';
import type OverlayProps from '../../types/overlay_props';
import Modal from '../../ui/modal';
import MergeResults from './merge_results';

interface MergePanelProps extends OverlayProps {
  customer: Customer;
  onMerged: (customer: Customer) => void;
}

/** Find the other record of the same person; it is merged into this one, which keeps its name and number. */
export default function MergePanel({ customer, onMerged, ...overlay }: MergePanelProps) {
  // Nothing loads until two letters are typed; each search asks the server with `q`.
  const { data: found, loading, get } = useGet<Customer[]>('/customers', { active: true });
  return (
    <Modal {...overlay} title={`Merge into ${customer.name}`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-body">
          Use this when one person was saved twice. The other record&apos;s orders, bookings and khata move here, its number is kept as a second number, and it is deleted.
        </p>
        <SearchInput label="Search by name or phone" initialValue="" onSearch={(q) => q.trim().length >= 2 && get({ params: { q: q.trim() } })} />
        {found && !loading && (
          <MergeResults
            found={found.filter((other) => other._id !== customer._id)}
            keep={customer}
            onMerged={(merged) => {
              onMerged(merged);
              overlay.close();
            }}
          />
        )}
      </div>
    </Modal>
  );
}
