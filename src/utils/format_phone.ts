import normalizePhone from './normalize_phone';

/** +923001234567 is shown as 0300-1234567. Other values are shown as they are. */
export default function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  return normalized ? `0${normalized.slice(3, 6)}-${normalized.slice(6)}` : phone;
}
