import WhatsAppLink from '../../components/whatsapp_link';
import type Customer from '../../types/customer';
import type KhataEntry from '../../types/khata_entry';
import formatDate from '../../utils/format_date';
import formatRs from '../../utils/format_rs';
import khataLabel from '../../utils/khata_label';
import useRestaurantSettings from '../../hooks/useRestaurantSettings';

interface KhataShareProps {
  customer: Customer;
  entries: KhataEntry[];
}

/** The last ten khata lines and the balance, ready to send on WhatsApp. */
export default function KhataShare({ customer, entries }: KhataShareProps) {
  const { restaurantName } = useRestaurantSettings();
  const lines = entries
    .slice(0, 10)
    .reverse()
    .map((entry) => `${formatDate(entry.createdAt)}  ${khataLabel(entry)}  ${entry.amount > 0 ? '+' : '-'}${formatRs(Math.abs(entry.amount))}`);
  const message = [`${restaurantName}: khata of ${customer.name}`, '', ...lines, '', `Balance: ${formatRs(customer.khataBalance)}`].join('\n');

  return (
    <div className="flex justify-end">
      <WhatsAppLink phone={customer.phone} message={message}>
        Send statement on WhatsApp
      </WhatsAppLink>
    </div>
  );
}
