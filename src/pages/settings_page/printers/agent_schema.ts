import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const agentSchema = z.object({
  name: requiredText('Name the PC, e.g. Counter PC').pipe(z.string().max(40)),
});

export default agentSchema;
