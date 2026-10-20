import { z } from 'zod';
import amountField from '../../../utils/amount_field';
import requiredText from '../../../utils/required_text';

const count = z.union([z.string(), z.number()]).transform((value) => Number(value)).pipe(z.number().int('Enter a whole number').min(0).max(20));

const addonGroupSchema = z
  .object({
    name: requiredText('Enter the group name').pipe(z.string().max(40)),
    min: count,
    max: count.pipe(z.number().min(1, 'At least 1')),
    options: z
      .array(z.object({ _id: z.string().optional(), name: requiredText('Enter the option').pipe(z.string().max(60)), price: amountField }))
      .min(1, 'Add at least one option'),
  })
  .refine((group) => group.min <= group.max, { message: "Can't be more than the most", path: ['min'] })
  .refine((group) => group.max <= group.options.length, { message: 'More than the options there are', path: ['max'] });

export default addonGroupSchema;
