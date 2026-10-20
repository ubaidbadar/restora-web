import PIN_PATTERN from '../../constants/pin_pattern';
import { z } from 'zod';

const unlockSchema = z.object({ pin: z.string().regex(PIN_PATTERN, 'Type your 4 to 6 digit PIN') });

export default unlockSchema;
