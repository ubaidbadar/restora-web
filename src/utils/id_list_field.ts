import { z } from 'zod';

/**
 * Ticked boxes of one group (roles, branches, permissions, teams). react-hook-form gives an array for a group, a string
 * or boolean for a single box, and false when nothing is ticked; all become a list.
 */
const idListField = z
  .union([z.array(z.string()), z.string(), z.boolean()])
  .optional()
  .transform((value) => (Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []));

export default idListField;
