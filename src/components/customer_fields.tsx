import type FormComponentProps from '../types/form_component_props';
import Input from '../ui/input';
import Textarea from '../ui/textarea';
import fieldError from '../utils/field_error';

type CustomerFieldsProps = Pick<FormComponentProps, 'register' | 'errors'>;

export default function CustomerFields({ register, errors }: CustomerFieldsProps) {
  return (
    <>
      <Input label="Name" dir="auto" required {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Mobile number" type="tel" inputMode="tel" placeholder="0300 1234567" required {...register('phone')} error={fieldError(errors, 'phone')} />
      <Input label="Other number (optional)" type="tel" inputMode="tel" placeholder="Mobile or landline" {...register('altPhone')} error={fieldError(errors, 'altPhone')} />
      <Input label="Area" dir="auto" placeholder="e.g. Gulberg, DHA Phase 5" {...register('area')} />
      <Textarea label="Addresses (one per line)" dir="auto" rows={3} className="min-h-0" {...register('addresses')} />
      <Input label="Tags (separate with commas)" placeholder="regular, corporate" {...register('tags')} />
      <Textarea label="Notes" dir="auto" rows={3} className="min-h-0" placeholder="Likes extra spicy, no onions…" {...register('notes')} />
    </>
  );
}
