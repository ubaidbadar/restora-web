import { z } from 'zod';
import amountField from '../../../utils/amount_field';
import idListField from '../../../utils/id_list_field';
import requiredText from '../../../utils/required_text';

// A dish needs a price: a blank box is an error, not Rs 0.
const price = z.union([z.number(), z.string().trim().min(1, 'Enter the price')]).pipe(amountField);
const sizeRow = z.object({ _id: z.string().optional(), name: z.string().trim().max(30), price });

/** One price needs no name; several need one each ("Half", "Full"), and no two the same. */
const dishSchema = z.object({
  name: requiredText('Enter the dish name').pipe(z.string().max(80)),
  categoryId: requiredText('Pick a category'),
  description: z.string().trim().max(200).default(''),
  sizes: z
    .array(sizeRow)
    .min(1, 'Add a price')
    .superRefine((sizes, ctx) => {
      if (sizes.length === 1) return;
      const seen = new Set<string>();
      sizes.forEach((size, index) => {
        if (!size.name) ctx.addIssue({ code: 'custom', path: [index, 'name'], message: 'Name this size' });
        else if (seen.has(size.name.toLowerCase())) ctx.addIssue({ code: 'custom', path: [index, 'name'], message: 'Two sizes have this name' });
        seen.add(size.name.toLowerCase());
      });
    })
    // A single price keeps no size name, even one left from a removed row.
    .transform((sizes) => (sizes.length === 1 ? [{ ...sizes[0]!, name: '' }] : sizes)),
  addonGroupIds: idListField,
  hidden: z.boolean().default(false),
});

export default dishSchema;
