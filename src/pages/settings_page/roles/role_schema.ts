import { z } from 'zod';
import idListField from '../../../utils/id_list_field';
import optionalText from '../../../utils/optional_text';
import requiredText from '../../../utils/required_text';

/** A new or renamed role. Its permissions come from the ticked boxes. */
const roleSchema = z.object({
  name: requiredText('Enter a name for the role').pipe(z.string().max(40)),
  description: optionalText,
  permissions: idListField,
});

export default roleSchema;
