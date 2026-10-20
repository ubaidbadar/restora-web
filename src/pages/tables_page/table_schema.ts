import { z } from 'zod';
import requiredText from '../../utils/required_text';

const seats = z.union([z.string(), z.number()]).transform((value) => (String(value).trim() ? Number(value) : null)).pipe(z.number().int('Whole number').min(1).max(100).nullable());

const tableSchema = z.object({
  name: requiredText('Enter the table name').pipe(z.string().max(20)),
  section: z.string().trim().max(30).default(''),
  seats,
});

export default tableSchema;
