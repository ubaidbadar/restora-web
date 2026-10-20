import { z } from 'zod';
import mobileField from '../../utils/mobile_field';

const optInSchema = z.object({
  name: z.string().trim().max(80).optional(),
  phone: mobileField,
  consent: z.literal(true, 'Tick the box to agree'),
});

export default optInSchema;
