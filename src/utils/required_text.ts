import { z } from 'zod';

/** Form fields arrive as text; these turn them into the stored shape and explain what is wrong in plain words. */
const requiredText = (message: string) => z.string().trim().min(1, message);

export default requiredText;
