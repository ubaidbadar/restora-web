import type Order from '../../types/order';
import Button from '../../ui/button';
import Drawer from '../../ui/drawer/modal';
import OrderDetails from '../../components/order_details';

interface OrderDetailsDrawerProps {
  order: Order;
}

/** The "Details" button on an order card, and the drawer it opens. */
export default function OrderDetailsDrawer({ order }: OrderDetailsDrawerProps) {
  const token = order.dailyToken;

  return (
    <Drawer
      title={`Order #${token}`}
      component={({ open }) => <Button variant="ghost" size="sm" className="ms-auto min-h-11 text-sm" aria-label={`Details of order ${token}`} onClick={open}>Details</Button>}
    >
      <OrderDetails order={order} />
    </Drawer>
  );
}
