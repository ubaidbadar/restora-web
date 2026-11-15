import can from '@shared/can';
import type Order from '../../types/order';
import useWorkplace from '../../hooks/useWorkplace';
import type OrderCancellation from '../../types/order_cancellation';
import changeOrder from '../../utils/change_order';
import CancelOrder from './cancel_order';
import OrderActionsMenu from './order_actions_menu';
import OrderDetailsDrawer from './order_details_drawer';
import OrderRowLine from './order_row_line';

interface TodayOrderRowProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/** A row of today's list: tap the row for details or use its menu for the same actions as the board. */
export default function TodayOrderRow({ order, onOrderUpdated }: TodayOrderRowProps) {
  const canPay = can(useWorkplace(), 'orders:payment');
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  const handleComplete = () => changeOrder({
    order,
    method: 'patch',
    url: `/orders/${order._id}`,
    body: { status: 'completed' },
    done: `Order #${order.dailyToken} marked complete`,
    onOrderUpdated,
  });

  const handleCancel = (body: Pick<OrderCancellation, 'reason' | 'note'>) => changeOrder({
    order,
    method: 'post',
    url: `/orders/${order._id}/cancel`,
    body,
    done: `Order #${order.dailyToken} cancelled`,
    onOrderUpdated,
  });

  return (
    <OrderDetailsDrawer
      order={order}
      payable={canPay && order.status !== 'cancelled' && order.status !== 'pending' && order.paymentStatus === 'unpaid' && !order.pendingSync}
      onOrderUpdated={onOrderUpdated}
      trigger={(showDetails) => (
        <CancelOrder
          order={order}
          onCancel={handleCancel}
          component={({ open: askCancel }) => (
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <OrderRowLine order={{ ...order, itemCount }} onClick={showDetails} />
              </div>
              <OrderActionsMenu
                order={order}
                onShowDetails={showDetails}
                onMarkComplete={handleComplete}
                onCancel={askCancel}
                showCompletionAction
              />
            </div>
          )}
        />
      )}
    />
  );
}
