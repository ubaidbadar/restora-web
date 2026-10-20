import PIN_PATTERN from './pin_pattern';
import { z } from 'zod';

/** A new POS PIN: 4 to 6 digits, not one anyone would guess first (repeated, or a straight run up or down). */
const pinSchema = z.object({
  pin: z
    .string()
    .regex(PIN_PATTERN, 'Use 4 to 6 digits')
    .refine((value) => {
      const digits = [...value].map(Number);
      const steps = digits.slice(1).map((digit, index) => digit - digits[index]!);
      const weak = steps.every((step) => step === 0) || steps.every((step) => step === 1) || steps.every((step) => step === -1);
      return !weak;
    }, 'Pick a PIN harder to guess than 1234 or 0000'),
});

export default pinSchema;
