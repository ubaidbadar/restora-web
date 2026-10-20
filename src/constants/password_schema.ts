import { z } from 'zod';
import requiredText from '../utils/required_text';

/** Changing your own password: the current one, then a new one of 8 or more characters. */
const passwordSchema = z.object({ current: requiredText('Enter your current password'), next: z.string().min(8, 'Use at least 8 characters').max(128) });

export default passwordSchema;
