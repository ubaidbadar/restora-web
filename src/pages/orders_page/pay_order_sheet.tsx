import { useState } from 'react';
import { Banknote } from 'lucide-react';
import can from '@shared/can';
import api from '../../config/api';
import PAYMENT_LABELS from '../../constants/payment_labels';
import PAYMENT_METHODS from '../../constants/payment_methods';
import type Order from '../../types/order';
import ModalOverlay from '../../ui/modal/modal';
import Button from '../../ui/button';
import Checkbox from '../../ui/checkbox';
import calcTotals from '../../utils/calc_totals';
import formatRs from '../../utils/format_rs';
import toast from '../../utils/toast';
import useRestaurantSettings from '../../hooks/useRestaurantSettings';
import useWorkplace from '../../hooks/useWorkplace';
import getAxiosMessage from '../../utils/get_axios_message';
import useOutboxStore from '../../store/outbox_store';
import syncOutbox from '../../utils/sync_outbox';
import queueOrderChange from '../../utils/queue_order_change';

interface PayOrderSheetProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
  /** Classes for the Pay button, which sits beside the card's main action. */
  className?: string;
}

interface PaymentOptionsProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
  close: () => void;
}

/** The payment choices and optional completion setting; unmounting the sheet resets that choice. */
function PaymentOptions({ order, onOrderUpdated, close }: PaymentOptionsProps) {
  const { taxByPaymentMethod } = useRestaurantSettings();
  const canComplete = can(useWorkplace(), 'orders:update') && order.status !== 'completed';
  const [markComplete, setMarkComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const totalBy = (method: (typeof PAYMENT_METHODS)[number]) =>
    calcTotals(order.items, order.discount, taxByPaymentMethod[method] ?? 0, order.deliveryFee, order.type === 'dine_in' ? order.serviceChargeType : undefined, order.serviceChargeValue ?? 0).total;

  const queueCompletion = (sync = true) => {
    queueOrderChange({
      order,
      method: 'patch',
      url: `/orders/${order._id}`,
      body: { status: 'completed' },
    });
    if (sync) void syncOutbox();
  };

  const recordPayment = async (method: (typeof PAYMENT_METHODS)[number], paymentStatus: 'paid' | 'khata' = 'paid') => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: paid } = await api.post(`/orders/${order._id}/payment`, { paymentMethod: method, ...(paymentStatus === 'khata' ? { paymentStatus } : {}) });
      let updated = paid;
      let completionWarning: string | undefined;

      if (markComplete && canComplete) {
        if (!useOutboxStore.getState().online) {
          queueCompletion(false);
          completionWarning = `Payment recorded. Completion for order #${order.dailyToken} is queued and will sync automatically.`;
        } else {
          try {
            const { data: completed } = await api.request({
              method: 'patch',
              url: `/orders/${order._id}`,
              data: { status: 'completed' },
            });
            updated = completed;
          } catch (err) {
            const status = typeof err === 'object' && err !== null && 'response' in err
              ? (err.response as { status?: number } | undefined)?.status
              : undefined;
            if (!status || status === 408 || status === 425 || status === 429 || status >= 500) {
              queueCompletion();
              completionWarning = `Payment recorded. Completion for order #${order.dailyToken} is queued and will sync automatically.`;
            } else {
              completionWarning = `Payment recorded, but order #${order.dailyToken} could not be marked complete: ${getAxiosMessage(err)}`;
            }
          }
        }
      }

      close();
      onOrderUpdated?.(updated);
      if (completionWarning) {
        toast.warning(completionWarning);
      } else if (markComplete && canComplete && paymentStatus === 'khata') {
        toast.success(`Order #${order.dailyToken} added to khata and marked complete`);
      } else if (markComplete && canComplete) {
        toast.success(`Order #${order.dailyToken} paid by ${PAYMENT_LABELS[method]} and marked complete`);
      } else if (paymentStatus === 'khata') {
        toast.success(`Order #${order.dailyToken} added to khata`);
      } else {
        toast.success(`Order #${order.dailyToken} paid by ${PAYMENT_LABELS[method]}`);
      }
    } catch (err) {
      setSubmitting(false);
      toast.error(getAxiosMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-2 text-sm text-muted">How did the customer pay? Tax depends on it, so each way shows its own total.</p>
      {canComplete && (
        <div className="mb-2 border-b border-border pb-3">
          <Checkbox
            checked={markComplete}
            disabled={submitting}
            onChange={(event) => setMarkComplete(event.target.checked)}
            label="Mark order as complete"
          />
        </div>
      )}
      {submitting && <p role="status" className="text-sm text-muted">Recording payment…</p>}
      {PAYMENT_METHODS.map((method) => (
        <Button
          key={method}
          variant="outline"
          size="lg"
          className="w-full"
          disabled={submitting}
          aria-busy={submitting}
          onClick={() => void recordPayment(method)}
        >
          <span className="flex-1 text-start">{PAYMENT_LABELS[method]}</span>
          <span className="tabular-nums">{formatRs(totalBy(method))}</span>
        </Button>
      ))}
      {order.customerId && (
        <div className="mt-2 border-t border-border pt-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={submitting}
            aria-busy={submitting}
            onClick={() => void recordPayment('cash', 'khata')}
          >
            <span className="flex-1 text-start">Add to khata</span>
            <span className="tabular-nums">{formatRs(totalBy('cash'))}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

/** "Pay" on an unpaid order: one tap to open, one tap on how the customer paid, each with its total after tax. */
export default function PayOrderSheet({ order, onOrderUpdated, className = '' }: PayOrderSheetProps) {
  return (
    <ModalOverlay
      title={`Order #${order.dailyToken}${order.tableName ? ` · Table ${order.tableName}` : ''}`}
      component={({ open }) => (
        <Button variant="outline" icon={Banknote} className={className} aria-label={`Record payment for order ${order.dailyToken}`} onClick={open}>
          Pay
        </Button>
      )}
    >
      {(close) => <PaymentOptions order={order} onOrderUpdated={onOrderUpdated} close={close} />}
    </ModalOverlay>
  );
}
