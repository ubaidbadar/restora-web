import { z } from 'zod';

/** Home's filter: a quick pick of days or picked From and To days, and this branch or all branches. */
const schema = z
  .object({
    days: z.string(),
    from: z.string(),
    to: z.string(),
    scope: z.string(),
  })
  .refine((data) => data.days !== 'pick' || Boolean(data.from), { path: ['from'], message: 'Pick the first day' })
  .refine((data) => data.days !== 'pick' || Boolean(data.to), { path: ['to'], message: 'Pick the last day' });

export default schema;
