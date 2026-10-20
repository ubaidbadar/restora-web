import { z } from 'zod';
import parseAmount from './parse_amount';

/** Whole rupees, zero or more. A minus sign is refused, not dropped ("-10" must not save as Rs 10). */
const amountField = z
  .union([z.string(), z.number()])
  .refine((value) => !String(value).trim().startsWith('-'), 'Enter 0 or more')
  .transform(parseAmount);

export default amountField;
