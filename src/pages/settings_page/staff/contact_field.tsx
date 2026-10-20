import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Their email, or the mobile number to send the WhatsApp link to. */
export default function ContactField({ register, errors, control }: Pick<FormComponentProps, 'register' | 'errors' | 'control'>) {
  const channel = useWatch({ control, name: 'channel' });
  if (channel === 'phone') {
    return <Input key="phone" label="Mobile number" type="tel" inputMode="tel" placeholder="0300 1234567" required autoFocus {...register('phone')} error={fieldError(errors, 'phone')} />;
  }
  return <Input key="email" label="Email" type="email" inputMode="email" required autoFocus {...register('email')} error={fieldError(errors, 'email')} />;
}
