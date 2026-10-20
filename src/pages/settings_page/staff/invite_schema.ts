import { z } from 'zod';
import emailField from '../../../utils/email_field';
import idListField from '../../../utils/id_list_field';
import optionalText from '../../../utils/optional_text';

const inviteSchema = z
  .object({
    channel: z.enum(['email', 'phone']),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    name: optionalText,
    roleIds: idListField,
    branchScope: z.enum(['all', 'list']),
    branchIds: idListField,
  })
  .superRefine((value, ctx) => {
    if (value.channel === 'email' && !emailField.safeParse(value.email ?? '').success) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Enter an email like name@example.com' });
    if (value.channel === 'phone' && (value.phone ?? '').replace(/\D/g, '').length < 10) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Enter a mobile number like 0300 1234567' });
    if (!value.roleIds.length) ctx.addIssue({ code: 'custom', path: ['roleIds'], message: 'Pick at least one role' });
    if (value.branchScope === 'list' && !value.branchIds.length) ctx.addIssue({ code: 'custom', path: ['branchIds'], message: 'Pick at least one branch' });
  })
  .transform(({ email, phone, ...value }) => ({ ...value, ...(value.channel === 'email' ? { email } : { phone }) }));

export default inviteSchema;
