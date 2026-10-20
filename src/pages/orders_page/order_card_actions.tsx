import { Link } from 'react-router';
import useCan from '../../hooks/useCan';
import { Pencil, ArrowRight, X } from 'lucide-react';
import api from '../../config/api';
import STATUS_LABELS from '../../constants/status_labels';
import type Order from '../../types/order';
import type OrderStatus from '../../types/order_status';
import AlertModal from '../../ui/alert_modal/modal';
import Button from '../../ui/button';
import IconButton from '../../ui/icon_button';
import toast from '../../utils/toast';
import PayOrderSheet from './pay_order_sheet';
import getAxiosMessage from '../../utils/get_axios_message';
import useOutboxStore from '../../store/outbox_store';
import syncOutbox from '../../utils/sync_outbox';

interface OrderCardActionsProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
}

const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  preparing: 'Start',
  ready: 'Mark ready',
  out_for_delivery: 'Send out',
  completed: 'Complete',
};

/** Where "advance" takes an order next, or null when it is finished. */
const nextStatus = (order: Pick<Order, 'status' | 'type'>): OrderStatus | null => {
  if (order.status === 'new') return 'preparing';
  if (order.status === 'preparing') return 'ready';
  if (order.status === 'ready') return order.type === 'delivery' ? 'out_for_delivery' : 'completed';
  if (order.status === 'out_for_delivery') return 'completed';
  return null;
};

/** Move the order on, cancel it or record its payment. */
export default function OrderCardActions({ order, onOrderUpdated }: OrderCardActionsProps) {
  const next = nextStatus(order);
  const token = order.dailyToken;
  const canEdit = useCan('orders:update');

  /**
   * Sends the change, or, without internet (or for an order still waiting to sync), keeps it in the outbox and shows it
   * on the board at once; it is sent, in order, once the internet is back.
   */
  const change = (method: 'post' | 'patch', url: string, body: unknown, done: string) => {
    const queue = () => {
      // The board lays the waiting change over the order (orders_page/board_with_outbox).
      useOutboxStore.getState().add({ id: `${order._id}-${Date.now().toString(36)}`, method, url, body, label: `Order #${token}`, createdAt: new Date().toISOString() });
      toast.success(`${done}. It will be sent when the internet is back.`);
    };
    if (order.pendingSync || !useOutboxStore.getState().online) return queue();
    api
      .request({ method, url, data: body })
      .then((res) => {
        onOrderUpdated?.(res.data);
        toast.success(done);
      })
      .catch((err) => (err.response ? toast.error(getAxiosMessage(err)) : (queue(), void syncOutbox())));
  };

  const handleAdvance = () => next && change('patch', `/orders/${order._id}`, { status: next }, `Order #${token} moved to ${STATUS_LABELS[next]}`);
  const handleCancel = () => change('post', `/orders/${order._id}/cancel`, undefined, `Order #${token} cancelled`);

  return (
    <>
      {/* Payments change what customers owe, so they wait for internet. */}
      {order.paymentStatus === 'unpaid' && !order.pendingSync && <PayOrderSheet order={order} onOrderUpdated={onOrderUpdated} />}
      {next && (
        <div className="flex items-center gap-2">
          <Button
            icon={ArrowRight}
            iconPosition="right"
            className="min-h-11 flex-1 whitespace-nowrap"
            aria-label={`${ADVANCE_LABELS[next]} order ${token}`}
            onClick={handleAdvance}
          >
            {ADVANCE_LABELS[next]}
          </Button>
          {/* Dishes can change until the order is on the way or done, while the bill is still open. */}
          {canEdit && order.status !== 'out_for_delivery' && order.paymentStatus === 'unpaid' && (
            <IconButton as={Link} to={`/orders/${order._id}/edit`} icon={Pencil} variant="outline" aria-label={`Edit order ${token}`} className="size-11" />
          )}
          <AlertModal
            title={`Cancel order #${token}?`}
            description="It leaves the board and is not counted in sales. Its customer's khata and totals are corrected."
            confirmText="Cancel order"
            cancelText="Keep it"
            onConfirm={handleCancel}
            component={({ open }) => (
              <IconButton icon={X} variant="outline" aria-label={`Cancel order ${token}`} className="size-11 hover:border-danger-300 hover:bg-danger-50 hover:text-danger-700" onClick={open} />
            )}
          />
        </div>
      )}
    </>
  );
}
