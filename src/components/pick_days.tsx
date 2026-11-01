import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../types/form_component_props';
import Input from '../ui/input';
import dayKey from '../utils/day_key';
import fieldError from '../utils/field_error';

/** From and To, only once "Pick days" is chosen. Up to today. */
export default function PickDays({ register, errors, control }: Pick<FormComponentProps, 'register' | 'errors' | 'control'>) {
  const days = useWatch({ control, name: 'days' });
  if (days !== 'pick') return null;
  const today = dayKey();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Input type="date" label="From" max={today} {...register('from')} error={fieldError(errors, 'from')} />
      <Input type="date" label="To" max={today} {...register('to')} error={fieldError(errors, 'to')} />
    </div>
  );
}
