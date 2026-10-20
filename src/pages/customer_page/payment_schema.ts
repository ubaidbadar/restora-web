import { z } from 'zod';
import amountField from '../../utils/amount_field';

const paymentSchema = z.object({ amount: amountField.refine((value) => value > 0, 'Enter the amount received'), note: z.string().trim().max(200).optional() });

export default paymentSchema;
