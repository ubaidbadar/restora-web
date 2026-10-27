import { z } from 'zod';
import amountField from '../../../utils/amount_field';
import idListField from '../../../utils/id_list_field';
import requiredText from '../../../utils/required_text';

const part = z.object({
  itemId: requiredText('Pick a dish'),
  // Empty: the dish's first size.
  sizeId: z.string().optional().transform((sizeId) => sizeId || undefined),
  qty: z.coerce.number({ error: 'Enter how many' }).int('Enter a whole number').min(1, 'At least 1').max(20, 'At most 20'),
});
const time = z.string().trim().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 12:00').default('');

/**
 * A deal: dishes sold together at one price, with optional choices (add-on groups), days and hours. The form keeps one
 * price; the server stores it as the deal's only size, so `sizeId` keeps that size's id when editing.
 */
const dealSchema = z
  .object({
    name: requiredText('Enter the deal name').pipe(z.string().max(80)),
    categoryId: requiredText('Pick a category'),
    photo: z.string().nullish(),
    description: z.string().trim().max(200).default(''),
    sizeId: z.string().optional(),
    price: z.union([z.number(), z.string().trim().min(1, 'Enter the price')]).pipe(amountField),
    includes: z.array(part).min(1, 'Add the dishes in this deal').max(20),
    addonGroupIds: idListField,
    days: idListField.transform((days) => days.map(Number)),
    from: time,
    to: time,
    hidden: z.boolean().default(false),
  })
  .refine((deal) => (!deal.from && !deal.to) || (deal.from && deal.to && deal.from !== deal.to), { path: ['to'], message: 'Enter both times, or neither for all day' })
  .transform(({ sizeId, price, ...deal }) => ({ ...deal, sizes: [{ ...(sizeId && { _id: sizeId }), name: '', price }] }));

export default dealSchema;
