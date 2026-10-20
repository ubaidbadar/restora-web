import PAYMENT_METHODS from '../constants/payment_methods';

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export default PaymentMethod;
