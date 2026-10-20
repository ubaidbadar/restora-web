import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const deviceSchema = z.object({
  name: requiredText('Name this terminal, e.g. Counter 1').pipe(z.string().max(40)),
  idleLockSeconds: z.coerce.number().int().min(30, 'At least 30 seconds').max(3600, 'At most an hour'),
  lockAfterOrder: z.boolean().default(false),
});

export default deviceSchema;
