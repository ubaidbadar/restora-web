import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const categorySchema = z.object({
  name: requiredText('Enter the category name').pipe(z.string().max(40)),
  priority: z.coerce.number().int().min(1, 'Priority must be at least 1').max(10000),
});

export default categorySchema;
