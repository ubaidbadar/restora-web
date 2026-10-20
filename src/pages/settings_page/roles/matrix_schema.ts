import { z } from 'zod';
import idListField from '../../../utils/id_list_field';

/** The matrix: for each role (field `p.r<roleId>`), the ticked permissions. */
const matrixSchema = z.object({ p: z.record(z.string(), idListField).default({}) });

export default matrixSchema;
