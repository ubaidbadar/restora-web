import type PaymentMethod from '../types/payment_method';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  bank: 'Bank transfer',
};

export default PAYMENT_LABELS;
