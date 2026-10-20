import { z } from 'zod';
import idListField from '../../../utils/id_list_field';

/** Roles and branch access, shared by the invite and edit-access forms. */
const accessSchema = z
  .object({
    roleIds: idListField,
    branchScope: z.enum(['all', 'list']),
    branchIds: idListField,
  })
  .superRefine((value, ctx) => {
    if (!value.roleIds.length) ctx.addIssue({ code: 'custom', path: ['roleIds'], message: 'Pick at least one role' });
    if (value.branchScope === 'list' && !value.branchIds.length) ctx.addIssue({ code: 'custom', path: ['branchIds'], message: 'Pick at least one branch' });
  });

export default accessSchema;
