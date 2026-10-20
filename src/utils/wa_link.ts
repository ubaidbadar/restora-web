import normalizePhone from './normalize_phone';

/** Digits for a wa.me link: 923XXXXXXXXX. */
const waDigits = (phone: string) => (normalizePhone(phone) ?? phone).replace(/\D/g, '');

/** Opens WhatsApp with the message ready to send. No API is involved. */
const waLink = (phone: string, message = '') =>
  `https://wa.me/${waDigits(phone)}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export default waLink;
