import { useNavigate } from 'react-router';
import can from '@shared/can';
import useWorkplace from '../../hooks/useWorkplace';
import { ArrowRight, ChefHat, FileText, MoreHorizontal, Pencil, Receipt, X } from 'lucide-react';
import api from '../../config/api';
import STATUS_LABELS from '../../constants/status_labels';
import type Order from '../../types/order';
import type OrderStatus from '../../types/order_status';
import Button from '../../ui/button';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';
import formatRs from '../../utils/format_rs';
import printSlip from '../../utils/print_slip';
import printOnThisPc from '../../utils/print_on_this_pc';
import toast from '../../utils/toast';
import OrderDetailsDrawer from './order_details_drawer';
import PayOrderSheet from './pay_order_sheet';
import CancelOrder from './cancel_order';
import type OrderCancellation from '../../types/order_cancellation';
import getAxiosMessage from '../../utils/get_axios_message';
import useOutboxStore from '../../store/outbox_store';
import useAuthStore from '../../store/auth_store';
import syncOutbox from '../../utils/sync_outbox';

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

/** Where "advance" takes an order next, or null when it is finished. */
const nextStatus = (order: Pick<Order, 'status' | 'type'>): OrderStatus | null => {
  if (order.status === 'pending') return 'new';
  if (order.status === 'new') return 'preparing';
  if (order.status === 'preparing') return 'ready';
  if (order.status === 'ready') return order.type === 'delivery' ? 'out_for_delivery' : 'completed';
  if (order.status === 'out_for_delivery') return 'completed';
  return null;
};

/**
 * The bottom of an order card: the total with a menu of everything else (details, print, edit, cancel), then at most two
 * buttons, the main one moving the order on. A guest's order shows Turn down and Accept; an unpaid one also Pay.
 * Side by side on a wide card, one above the other on a narrow one (five board columns).
 */
export default function OrderCardFooter({ order, onOrderUpdated }: OrderCardFooterProps) {
  const navigate = useNavigate();
  const workplace = useWorkplace();
  const token = order.dailyToken;
  const pending = order.status === 'pending';
  // Each button only for people who may use it (the server checks again).
  const canMove = can(workplace, 'orders:update');
  const canCancel = can(workplace, 'orders:cancel');
  const next = canMove ? nextStatus(order) : null;
  const active = order.status !== 'completed' && order.status !== 'cancelled';
  // Dishes can change until the order is on the way or done, while the bill is still open.
  const editable = canMove && active && order.status !== 'out_for_delivery' && order.paymentStatus === 'unpaid';
  // Payments change what customers owe, so they wait for internet. A guest's order is accepted before it is paid.
  const payable = can(workplace, 'orders:payment') && order.status !== 'cancelled' && order.paymentStatus === 'unpaid' && !order.pendingSync && !pending;
  const button = 'min-w-0 flex-1 basis-full whitespace-nowrap @[15rem]:basis-0';

  /**
   * Sends the change, or, without internet (or for an order still waiting to sync), keeps it in the outbox and shows it
   * on the board at once; it is sent, in order, once the internet is back.
   */
  const change = (method: 'post' | 'patch', url: string, body: unknown, done: string, printOnDone?: Order) => {
    const queue = () => {
      // The board lays the waiting change over the order (orders_page/board_with_outbox).
      useOutboxStore.getState().add({ id: `${order._id}-${Date.now().toString(36)}`, method, url, body, label: `Order #${token}`, createdAt: new Date().toISOString() });
      if (printOnDone) {
        void printOnThisPc(printOnDone, 'kitchen', `${order._id}~cancel-${Date.now().toString(36)}`);
      }
      toast.success(
        `${done}. It will be sent when the internet is back.`,
        printOnDone && { label: 'Print slip', onClick: () => printSlip(printOnDone, 'kitchen') }
      );
    };
    if (order.pendingSync || !useOutboxStore.getState().online) return queue();
    api
      .request({ method, url, data: body })
      .then((res) => {
        onOrderUpdated?.(res.data);
        toast.success(
          done,
          printOnDone && { label: 'Print slip', onClick: () => printSlip(printOnDone, 'kitchen') }
        );
      })
      .catch((err) => (err.response ? toast.error(getAxiosMessage(err)) : (queue(), void syncOutbox())));
  };

  const handleAdvance = () => {
    const me = useAuthStore.getState().me;
    return (
      next &&
      change(
        'patch',
        `/orders/${order._id}`,
        { status: next, updatedBy: me?.user.name, updatedAt: new Date().toISOString() },
        pending ? `Order #${token} accepted` : `Order #${token} moved to ${STATUS_LABELS[next]}`
      )
    );
  };
  const handleCancel = (body: Pick<OrderCancellation, 'reason' | 'note'>) => {
    const me = useAuthStore.getState().me;
    const cancelMeta = {
      ...body,
      cancelledBy: me?.user.name,
      cancelledAt: new Date().toISOString(),
    };
    const cancelSlipOrder: Order = {
      ...order,
      status: 'cancelled',
      dailyToken: `${token} CANCELLED`,
      cancellation: { ...body, byName: me?.user.name, at: cancelMeta.cancelledAt },
      items: order.items.map((item) => ({
        ...item,
        name: item.name.startsWith('CANCEL ') ? item.name : `CANCEL ${item.name}`,
      })),
    };
    return change(
      'post',
      `/orders/${order._id}/cancel`,
      cancelMeta,
      pending ? `Order #${token} turned down` : `Order #${token} cancelled`,
      cancelSlipOrder
    );
  };

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
                <DropdownMenu
                  trigger={(isOpen) => <IconButton icon={MoreHorizontal} variant="ghost" aria-label={`More for order ${token}`} aria-haspopup="menu" aria-expanded={isOpen} />}
                  items={[
                    { label: 'Details', icon: FileText, onClick: showDetails },
                    { label: 'Print kitchen slip', icon: ChefHat, onClick: () => printSlip(order, 'kitchen') },
                    { label: 'Print receipt', icon: Receipt, onClick: () => printSlip(order, 'receipt') },
                    ...(editable ? [{ label: 'Edit order', icon: Pencil, onClick: () => navigate(`/orders/${order._id}/edit`) }] : []),
                    ...(canCancel && active && !pending ? [{ label: 'Cancel order', icon: X, danger: true, onClick: askCancel }] : []),
                  ]}
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
