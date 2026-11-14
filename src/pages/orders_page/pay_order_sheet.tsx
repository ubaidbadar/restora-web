import { Banknote } from 'lucide-react';
import api from '../../config/api';
import PAYMENT_LABELS from '../../constants/payment_labels';
import PAYMENT_METHODS from '../../constants/payment_methods';
import type Order from '../../types/order';
import ModalOverlay from '../../ui/modal/modal';
import Button from '../../ui/button';
import calcTotals from '../../utils/calc_totals';
import formatRs from '../../utils/format_rs';
import toast from '../../utils/toast';
import useRestaurantSettings from '../../hooks/useRestaurantSettings';
import getAxiosMessage from '../../utils/get_axios_message';

interface PayOrderSheetProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
  /** Classes for the Pay button, which sits beside the card's main action. */
  className?: string;
}

/** "Pay" on an unpaid order: one tap to open, one tap on how the customer paid, each with its total after tax. */
export default function PayOrderSheet({ order, onOrderUpdated, className = '' }: PayOrderSheetProps) {
  const { taxByPaymentMethod } = useRestaurantSettings();
  const totalBy = (method: (typeof PAYMENT_METHODS)[number]) =>
    calcTotals(order.items, order.discount, taxByPaymentMethod[method] ?? 0, order.deliveryFee, order.type === 'dine_in' ? order.serviceChargeType : undefined, order.serviceChargeValue ?? 0).total;

  return (
    <ModalOverlay
      title={`Order #${order.dailyToken}${order.tableName ? ` · Table ${order.tableName}` : ''}`}
      component={({ open }) => (
        <Button variant="outline" icon={Banknote} className={className} aria-label={`Record payment for order ${order.dailyToken}`} onClick={open}>
          Pay
        </Button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-2">
          <p className="mb-2 text-sm text-muted">How did the customer pay? Tax depends on it, so each way shows its own total.</p>
          {PAYMENT_METHODS.map((method) => (
            <Button
              key={method}
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                api
                  .post(`/orders/${order._id}/payment`, { paymentMethod: method })
                  .then((res) => {
                    close();
                    onOrderUpdated?.(res.data);
                    toast.success(`Order #${order.dailyToken} paid by ${PAYMENT_LABELS[method]}`);
                  })
                  .catch((err) => toast.error(getAxiosMessage(err)));
              }}
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
                onClick={() => {
                  api
                    .post(`/orders/${order._id}/payment`, { paymentMethod: 'cash', paymentStatus: 'khata' })
                    .then((res) => {
                      close();
                      onOrderUpdated?.(res.data);
                      toast.success(`Order #${order.dailyToken} added to khata`);
                    })
                    .catch((err) => toast.error(getAxiosMessage(err)));
                }}
              >
                <span className="flex-1 text-start">Add to khata</span>
                <span className="tabular-nums">{formatRs(totalBy('cash'))}</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </ModalOverlay>
  );
}
