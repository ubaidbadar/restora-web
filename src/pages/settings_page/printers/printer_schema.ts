import { z } from 'zod';
import idListField from '../../../utils/id_list_field';
import requiredText from '../../../utils/required_text';

const printerSchema = z.object({
  label: requiredText('Name this printer, e.g. Kitchen').pipe(z.string().max(30)),
  prints: idListField,
  categoryIds: idListField,
  width: z.coerce.number().pipe(z.union([z.literal(48), z.literal(32)])),
  copies: z.coerce.number().int().min(1, 'At least 1').max(5, 'At most 5'),
});

export default printerSchema;
