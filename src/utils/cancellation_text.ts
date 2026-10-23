import CANCEL_REASON_LABELS from '../constants/cancel_reason_labels';
import type OrderCancellation from '../types/order_cancellation';
import formatTime from './format_time';

/** "Out of stock · No chicken left · Sana, 3:40 pm": why, then who and when. */
export default function cancellationText(cancellation: OrderCancellation): string {
  const why = [cancellation.reason && cancellation.reason !== 'other' && CANCEL_REASON_LABELS[cancellation.reason], cancellation.note].filter(Boolean).join(' · ');
  const who = [cancellation.byName, formatTime(cancellation.at)].filter(Boolean).join(', ');
  return [why, who].filter(Boolean).join(' · ');
}
