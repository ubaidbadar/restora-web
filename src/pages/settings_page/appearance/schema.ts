import { z } from 'zod';

/** Settings → Appearance: the restaurant's theme, light or dark, and the desktop sidebar. */
const appearanceSchema = z.object({
  appearance: z.object({
    theme: z.enum(['indigo', 'saffron', 'emerald', 'ocean', 'bordeaux', 'onyx']),
    mode: z.enum(['light', 'dark', 'system']),
    sidebar: z.enum(['theme', 'plain']),
  }),
});

export default appearanceSchema;
