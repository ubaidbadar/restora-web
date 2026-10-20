import { z } from 'zod';

/** An email address, saved trimmed and lowercase. */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter an email like name@example.com'));

export default emailField;
