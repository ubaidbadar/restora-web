import type { ReactNode } from 'react';
import type Order from '../../types/order';
import Drawer from '../../ui/drawer/modal';
import OrderView from '../../components/order_view';
import PayOrderSheet from './pay_order_sheet';

interface OrderDetailsDrawerProps {
  order: Order;
  payable?: boolean;
  onOrderUpdated?: (order: Order) => void;
  /** What opens it (on a card, the "Details" entry of its menu). */
  trigger: (open: () => void) => ReactNode;
}

/** An order's details in a drawer. */
export default function OrderDetailsDrawer({ order, payable = false, onOrderUpdated, trigger }: OrderDetailsDrawerProps) {
  return (
    <Drawer
      title={`Order #${order.dailyToken}`}
      component={({ open }) => trigger(open)}
      footer={
        payable
          ? (close) => (
              <PayOrderSheet
                order={order}
                onOrderUpdated={(updated) => {
                  onOrderUpdated?.(updated);
                  close();
                }}
                className="w-full"
              />
            )
          : undefined
      }
    >
      <OrderView order={order} />
    </Drawer>
  );
}
