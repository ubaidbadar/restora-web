import ORDER_TYPE_LABELS from '../constants/order_type_labels';
import PAYMENT_LABELS from '../constants/payment_labels';
import STATUS_LABELS from '../constants/status_labels';
import WhatsAppLink from './whatsapp_link';
import type Order from '../types/order';
import formatDate from '../utils/format_date';
import formatRs from '../utils/format_rs';
import formatTime from '../utils/format_time';
import lineDetails from '../utils/line_details';
import TotalsList from './totals_list';
import useRestaurantSettings from '../hooks/useRestaurantSettings';

interface OrderDetailsProps {
  order: Order;
}

const PAYMENT_TEXT = { paid: 'Paid', unpaid: 'Not paid yet', khata: 'On khata' };
const PAYMENT_LINES = { paid: 'Paid by', unpaid: 'To pay by', khata: 'Added to khata, tax as for' } as const;

/** A plain-text receipt, short enough to read in a WhatsApp message. */
function receiptText(order: Order, restaurantName: string): string {
  const lines = [
    restaurantName,
    `Order #${order.dailyToken} · ${ORDER_TYPE_LABELS[order.type]} · ${formatDate(order.createdAt)}, ${formatTime(order.createdAt)}`,
    '',
    ...order.items.map((item) => `${item.qty} x ${[item.name, lineDetails(item)].filter(Boolean).join(', ')}: ${formatRs(item.price * item.qty)}`),
    '',
    `Subtotal: ${formatRs(order.subtotal)}`,
    ...(order.discount ? [`Discount: -${formatRs(order.discount)}`] : []),
    order.paymentMethod ? `Tax (${order.taxRate}%): ${formatRs(order.tax)}` : 'Tax: added when paid',
    ...(order.deliveryFee ? [`Delivery: ${formatRs(order.deliveryFee)}`] : []),
    `Total: ${formatRs(order.total)}`,
    order.paymentMethod ? `${PAYMENT_LINES[order.paymentStatus]} ${PAYMENT_LABELS[order.paymentMethod]}` : 'Not paid yet',
    '',
    'Thank you!',
  ];
  return lines.join('\n');
}

/** Everything about one order: what was ordered, what it cost, how it is being paid. */
export default function OrderDetails({ order }: OrderDetailsProps) {
  const { restaurantName } = useRestaurantSettings();
  const customer = order.customer;
  const where = [order.tableName && `Table ${order.tableName}`, order.area, order.address, order.rider && `Rider: ${order.rider}`].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col gap-5 text-ink">
      <p className="text-sm text-muted">
        {ORDER_TYPE_LABELS[order.type]} · {STATUS_LABELS[order.status]} · {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
        {customer && <span className="mt-1 block text-base font-semibold text-ink"><bdi>{customer.name}</bdi></span>}
        {where && <span dir="auto" className="block">{where}</span>}
      </p>
      <ul className="divide-y divide-border border-y border-border text-sm">
        {order.items.map((item, index) => (
          <li key={index} className="flex justify-between gap-3 py-2.5">
            <span dir="auto">
              {item.qty} × {item.name}
              {lineDetails(item) && <span className="block text-muted">{lineDetails(item)}</span>}
              {item.note && <span className="block text-muted italic">“{item.note}”</span>}
            </span>
            <span className="shrink-0 whitespace-nowrap tabular-nums">{formatRs(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>
      <TotalsList totals={order} taxRate={order.paymentMethod ? order.taxRate : null} deliveryFee={order.deliveryFee} />
      <p className="-mt-2 flex justify-between border-t border-border pt-3 text-xl font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatRs(order.total)}</span>
      </p>
      <p className="rounded-control bg-sunken px-3 py-2 text-sm text-body">{[PAYMENT_TEXT[order.paymentStatus], order.paymentMethod && PAYMENT_LABELS[order.paymentMethod]].filter(Boolean).join(' · ')}</p>
      {customer && <WhatsAppLink phone={customer.phone} message={receiptText(order, restaurantName)}>Send receipt on WhatsApp</WhatsAppLink>}
    </div>
  );
}
