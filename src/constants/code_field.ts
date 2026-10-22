import { z } from 'zod';

/** The 6-digit code we email to confirm an address or reset a password. Spaces people paste in are dropped. */
const codeField = z
  .string()
  .transform((value) => value.replace(/\s/g, ''))
  .pipe(z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from the email'));

export default codeField;
