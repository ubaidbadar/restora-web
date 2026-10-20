import { z } from 'zod';
import idListField from '../../../utils/id_list_field';
import optionalText from '../../../utils/optional_text';
import requiredText from '../../../utils/required_text';

const teamSchema = z.object({
  name: requiredText('Enter the team name').pipe(z.string().max(60)),
  description: optionalText,
  /** Empty: the whole restaurant. */
  branchId: z.string().transform((value) => value || null),
  membershipIds: idListField,
});

export default teamSchema;
