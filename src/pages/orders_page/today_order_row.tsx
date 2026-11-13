import can from '@shared/can';
import useAuthStore from '../../store/auth_store';
import type Order from '../../types/order';
import OrderDetailsDrawer from './order_details_drawer';
import OrderRowLine from './order_row_line';

interface TodayOrderRowProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
  onSelectOrder?: (order: Order) => void;
  selected?: boolean;
}

/** A row of today's list; a tap opens the side panel when enabled, otherwise its details drawer. */
export default function TodayOrderRow({ order, onOrderUpdated, onSelectOrder, selected = false }: TodayOrderRowProps) {
  const canPay = can(useAuthStore((state) => state.me?.workplace), 'orders:payment');
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  if (onSelectOrder) {
    return <OrderRowLine order={{ ...order, itemCount }} selected={selected} onClick={() => onSelectOrder(order)} />;
  }
  return (
    <OrderDetailsDrawer
      order={order}
      payable={canPay && order.status !== 'cancelled' && order.paymentStatus === 'unpaid' && !order.pendingSync}
      onOrderUpdated={onOrderUpdated}
      trigger={(open) => <OrderRowLine order={{ ...order, itemCount }} onClick={open} />}
    />
  );
}
