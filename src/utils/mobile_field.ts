import { z } from 'zod';
import normalizePhone from './normalize_phone';

const mobileField = z
  .string()
  .refine((value) => normalizePhone(value) !== null, 'Enter a mobile number like 0300 1234567')
  .transform((value) => normalizePhone(value)!);

export default mobileField;
