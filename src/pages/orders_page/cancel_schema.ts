import { z } from 'zod';
import CANCEL_REASON_LABELS from '../../constants/cancel_reason_labels';
import type CancelReason from '../../types/cancel_reason';

const REASONS = Object.keys(CANCEL_REASON_LABELS) as [CancelReason, ...CancelReason[]];

/** Why an order is cancelled; "Other" needs a few words. */
const cancelSchema = z
  .object({
    reason: z.enum(REASONS, { error: 'Pick a reason' }),
    note: z.string().trim().max(200, 'Keep it under 200 characters').optional(),
  })
  .refine((data) => data.reason !== 'other' || Boolean(data.note), { path: ['note'], message: 'Say why it was cancelled' });

export default cancelSchema;
