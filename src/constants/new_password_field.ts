import { z } from 'zod';

/** A new password: 8 to 128 characters, like the server asks. */
const newPasswordField = z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters');

export default newPasswordField;
