import { z } from 'zod';

/** The orders filter: a quick pick of days or picked From and To days, the order type, and the board or a list. */
const filterSchema = z
  .object({
    days: z.string(),
    from: z.string(),
    to: z.string(),
    type: z.string(),
    view: z.string(),
  })
  .refine((data) => data.days !== 'pick' || Boolean(data.from), { path: ['from'], message: 'Pick the first day' })
  .refine((data) => data.days !== 'pick' || Boolean(data.to), { path: ['to'], message: 'Pick the last day' });

export default filterSchema;
