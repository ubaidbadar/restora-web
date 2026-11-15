import { ArrowRight } from 'lucide-react';
import can from '@shared/can';
import useWorkplace from '../../hooks/useWorkplace';
import type Order from '../../types/order';
import type OrderStatus from '../../types/order_status';
import Button from '../../ui/button';
import formatRs from '../../utils/format_rs';
import STATUS_LABELS from '../../constants/status_labels';
import changeOrder from '../../utils/change_order';
import nextOrderStatus from '../../utils/next_order_status';
import OrderDetailsDrawer from './order_details_drawer';
import PayOrderSheet from './pay_order_sheet';
import CancelOrder from './cancel_order';
import type OrderCancellation from '../../types/order_cancellation';
import OrderActionsMenu from './order_actions_menu';

interface OrderCardFooterProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
}

const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  new: 'Accept',
  preparing: 'Start',
  ready: 'Mark ready',
  out_for_delivery: 'Send out',
  completed: 'Complete',
};

/**
 * The bottom of an order card: the total with a menu of everything else (details, print, edit, cancel), then at most two
 * buttons, the main one moving the order on. A guest's order shows Turn down and Accept; an unpaid one also Pay.
 * Side by side on a wide card, one above the other on a narrow one (five board columns).
 */
export default function OrderCardFooter({ order, onOrderUpdated }: OrderCardFooterProps) {
  const workplace = useWorkplace();
  const token = order.dailyToken;
  const pending = order.status === 'pending';
  const canMove = can(workplace, 'orders:update');
  const canCancel = can(workplace, 'orders:cancel');
  const next = canMove ? nextOrderStatus(order) : null;
  // Payments change what customers owe, so they wait for internet. A guest's order is accepted before it is paid.
  const payable = can(workplace, 'orders:payment') && order.status !== 'cancelled' && order.paymentStatus === 'unpaid' && !order.pendingSync && !pending;
  const button = 'min-w-0 flex-1 basis-full whitespace-nowrap @[15rem]:basis-0';

  const handleAdvance = () => {
    if (!next) return;
    changeOrder({
      order,
      method: 'patch',
      url: `/orders/${order._id}`,
      body: { status: next },
      done: pending ? `Order #${token} accepted` : `Order #${token} moved to ${STATUS_LABELS[next]}`,
      onOrderUpdated,
    });
  };

  const handleComplete = () => changeOrder({
    order,
    method: 'patch',
    url: `/orders/${order._id}`,
    body: { status: 'completed' },
    done: `Order #${token} marked complete`,
    onOrderUpdated,
  });

  const handleCancel = (body: Pick<OrderCancellation, 'reason' | 'note'>) => changeOrder({
    order,
    method: 'post',
    url: `/orders/${order._id}/cancel`,
    body,
    done: pending ? `Order #${token} turned down` : `Order #${token} cancelled`,
    onOrderUpdated,
  });

  return (
    <OrderDetailsDrawer
      order={order}
      payable={payable}
      onOrderUpdated={onOrderUpdated}
      trigger={(showDetails) => (
        <CancelOrder
          order={order}
          onCancel={handleCancel}
          component={({ open: askCancel }) => (
            <>
              <div className="-mb-1 flex items-center gap-2 border-t border-border pt-2.5">
                <span className="me-auto font-semibold whitespace-nowrap tabular-nums text-ink">
                  {formatRs(order.total)}
                  {!order.paymentMethod && <span className="block text-xs font-normal text-muted">+ tax when paid</span>}
                </span>
                <OrderActionsMenu
                  order={order}
                  onShowDetails={showDetails}
                  onMarkComplete={handleComplete}
                  onCancel={askCancel}
                />
              </div>
              {(next || payable || (pending && canCancel)) && (
                <div className="@container">
                  <div className="flex flex-wrap gap-2">
                    {pending && canCancel && (
                      <Button variant="outline" className={button} aria-label={`Turn down order ${token}`} onClick={askCancel}>
                        Turn down
                      </Button>
                    )}
                    {payable && <PayOrderSheet order={order} onOrderUpdated={onOrderUpdated} className={button} />}
                    {next && (
                      <Button icon={ArrowRight} iconPosition="right" className={button} aria-label={`${ADVANCE_LABELS[next]} order ${token}`} onClick={handleAdvance}>
                        {ADVANCE_LABELS[next]}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        />
      )}
    />
  );
}
