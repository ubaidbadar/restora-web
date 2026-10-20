import { z } from 'zod';
import requiredText from '../utils/required_text';
import PAYMENT_METHODS from './payment_methods';
import TEMPLATE_KEYS from './template_keys';

// A blank box is an error, not 0%: an untaxed payment method must be typed as 0 on purpose.
const percent = z
  .union([z.number(), z.string().trim().min(1, 'Enter a rate, or 0 for none')])
  .transform(Number)
  .pipe(z.number('Enter a number').min(0, 'Cannot be below 0').max(50, 'Cannot be above 50'));
const forEach = <K extends string, V>(keys: readonly K[], value: V) => Object.fromEntries(keys.map((key) => [key, value])) as Record<K, V>;

const settingsSchema = z.object({
  restaurantName: requiredText('Enter the restaurant name'),
  logo: z.string().optional(),
  taxByPaymentMethod: z.object(forEach(PAYMENT_METHODS, percent)),
  whatsappTemplates: z.object(forEach(TEMPLATE_KEYS, z.string().trim())),
  receipt: z
    .object({
      ntn: z.string().trim().max(30, 'Up to 30 characters'),
      strn: z.string().trim().max(30, 'Up to 30 characters'),
      footer: z.string().trim().max(160, 'Keep it to 160 characters'),
    })
    .partial()
    .optional(),
});

export default settingsSchema;
