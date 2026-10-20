import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const transferSchema = z.object({
  membershipId: requiredText('Pick who gets the restaurant'),
  confirmName: requiredText('Type the restaurant name'),
  keepMeAsOwner: z.boolean().default(true),
});

export default transferSchema;
