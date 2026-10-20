import type PaymentStatus from '../types/payment_status';

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = { paid: 'Paid', unpaid: 'Pay later', khata: 'Add to khata' };

export default PAYMENT_STATUS_LABELS;
