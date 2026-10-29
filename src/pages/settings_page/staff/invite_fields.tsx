import Tabs from '../../../ui/tabs';
import type FormComponentProps from '../../../types/form_component_props';
import type Role from '../../../types/role';
import Input from '../../../ui/input';
import AccessFields from './access_fields';
import ContactField from './contact_field';

const CHANNELS = [
  { value: 'email', label: 'By email' },
  { value: 'phone', label: 'By WhatsApp' },
];

/** Who to invite and what they will be able to do. */
export default function InviteFields({ roles, ...form }: FormComponentProps & { roles: Role[] }) {
  return (
    <>
      <Tabs register={form.register} name="channel" label="Send the invitation" options={CHANNELS} value="email" wrap />
      <ContactField {...form} />
      <Input label="Their name (optional)" dir="auto" {...form.register('name')} />
      <AccessFields {...form} roles={roles} />
    </>
  );
}
