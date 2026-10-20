import { z } from 'zod';
import normalizePhone from './normalize_phone';

/** A second number may be a mobile or a landline (7 to 11 digits, kept as typed digits). */
const normalizeAltPhone = (input: string): string | null => {
  const digits = input.replace(/\D/g, '');
  return normalizePhone(input) ?? (digits.length >= 7 && digits.length <= 11 ? digits : null);
};

const altPhoneField = z
  .string()
  .optional()
  .refine((value) => !value?.trim() || normalizeAltPhone(value) !== null, 'Enter a mobile or landline number')
  .transform((value) => (value?.trim() ? normalizeAltPhone(value)! : undefined));

export default altPhoneField;
