import can from '@shared/can';
import useAuthStore from '../../store/auth_store';
import type Order from '../../types/order';
import OrderDetailsDrawer from './order_details_drawer';
import OrderRowLine from './order_row_line';

interface TodayOrderRowProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/** A row of today's list; a tap opens the order's details, with Pay while it is owed. */
export default function TodayOrderRow({ order, onOrderUpdated }: TodayOrderRowProps) {
  const canPay = can(useAuthStore((state) => state.me?.workplace), 'orders:payment');
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  return (
    <OrderDetailsDrawer
      order={order}
      payable={canPay && order.status !== 'cancelled' && order.paymentStatus === 'unpaid' && !order.pendingSync}
      onOrderUpdated={onOrderUpdated}
      trigger={(open) => <OrderRowLine order={{ ...order, itemCount }} onClick={open} />}
    />
  );
}
