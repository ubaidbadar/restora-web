import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const categorySchema = z.object({
  name: requiredText('Enter the category name').pipe(z.string().max(40)),
});

export default categorySchema;
