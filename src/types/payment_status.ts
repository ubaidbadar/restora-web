import PAYMENT_STATUSES from '../constants/payment_statuses';

type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export default PaymentStatus;
