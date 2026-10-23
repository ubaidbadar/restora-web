import { useSearchParams } from 'react-router';
import type Customer from '../../types/customer';
import Tabs from '../../ui/tabs';
import withParam from '../../utils/with_param';
import KhataTab from './khata_tab';
import NotesTab from './notes_tab';
import OrdersTab from './orders_tab';

interface ProfileTabsProps {
  customer: Customer;
  onCustomer: (customer: Customer) => void;
}

export default function ProfileTabs({ customer, onCustomer }: ProfileTabsProps) {
  // The open tab lives in the URL, so a refresh or a shared link keeps it.
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'orders';
  const setTab = (id: string) => setParams((prev) => withParam(prev, 'tab', id, 'orders'), { replace: true });
  const notes = { id: 'notes', label: 'Notes', content: <NotesTab customer={customer} onCustomer={onCustomer} /> };
  // Keyed by the balance: a payment recorded above (or taken back here) loads the lines again.
  const khata = { id: 'khata', label: 'Khata', content: <KhataTab customer={customer} onCustomer={onCustomer} /> };

  return (
    <Tabs
      activeTabId={tab}
      onChange={setTab}
      tabs={[{ id: 'orders', label: 'Orders', content: <OrdersTab customerId={customer._id} /> }, khata, notes]}
    />
  );
}
