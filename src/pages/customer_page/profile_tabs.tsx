import { useSearchParams } from 'react-router';
import type Customer from '../../types/customer';
import PageTabs from '../../ui/page_tabs';
import KhataTab from './khata_tab';
import NotesTab from './notes_tab';
import OrdersTab from './orders_tab';

interface ProfileTabsProps {
  customer: Customer;
  onCustomer: (customer: Customer) => void;
}

export default function ProfileTabs({ customer, onCustomer }: ProfileTabsProps) {
  // The open tab lives in the URL, so a refresh or a shared link keeps it.
  const [params] = useSearchParams();
  const notes = { value: 'notes', label: 'Notes', content: <NotesTab customer={customer} onCustomer={onCustomer} /> };
  // Keyed by the balance: a payment recorded above (or taken back here) loads the lines again.
  const khata = { value: 'khata', label: 'Khata', content: <KhataTab customer={customer} onCustomer={onCustomer} /> };

  const tabs = [{ value: 'orders', label: 'Orders', content: <OrdersTab customerId={customer._id} /> }, khata, notes];
  const tab = tabs.find((entry) => entry.value === params.get('tab')) ?? tabs[0]!;

  return (
    <>
      <PageTabs label="Customer" param="tab" options={tabs} value={tab.value} />
      <div className="py-4">{tab.content}</div>
    </>
  );
}
