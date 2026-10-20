import { z } from 'zod';

const number = (message: string) => z.union([z.string(), z.number()]).transform((value) => Number(value)).pipe(z.number({ message }).int(message).min(0, message).max(999, message));

/** "T", 1 to 20 → T1 … T20. Names already used in the branch are skipped. */
const batchSchema = z
  .object({
    prefix: z.string().trim().max(10).default(''),
    from: number('Enter a number'),
    to: number('Enter a number'),
    section: z.string().trim().max(30).default(''),
    seats: z.union([z.string(), z.number()]).transform((value) => (String(value).trim() ? Number(value) : undefined)).pipe(z.number().int().min(1).max(100).optional()),
  })
  .refine((range) => range.to >= range.from, { message: 'Must be the same or more than the first', path: ['to'] })
  .refine((range) => range.to - range.from < 100, { message: 'Up to 100 tables at a time', path: ['to'] });

export default batchSchema;
