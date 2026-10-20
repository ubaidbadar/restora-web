import { z } from 'zod';

const column = z.string().default('');

/** Which column is which (as the column's position), and what to do with people already saved. */
const importSchema = z
  .object({ name: column, phone: column, area: column, openingKhata: column, onExisting: z.enum(['skip', 'fill']) })
  .refine((mapping) => mapping.name !== '', { message: 'Pick the column with names', path: ['name'] })
  .refine((mapping) => mapping.phone !== '', { message: 'Pick the column with mobile numbers', path: ['phone'] });

export default importSchema;
