import type { ReactNode } from 'react';
import type Order from '../../types/order';
import Drawer from '../../ui/drawer/modal';
import OrderDetails from '../../components/order_details';

interface OrderDetailsDrawerProps {
  order: Order;
  /** What opens it (on a card, the "Details" entry of its menu). */
  trigger: (open: () => void) => ReactNode;
}

/** An order's details in a drawer. */
export default function OrderDetailsDrawer({ order, trigger }: OrderDetailsDrawerProps) {
  return (
    <Drawer title={`Order #${order.dailyToken}`} component={({ open }) => trigger(open)}>
      <OrderDetails order={order} />
    </Drawer>
  );
}
