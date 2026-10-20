import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import Toggle from '../../../ui/toggle';
import fieldError from '../../../utils/field_error';

/** A terminal's name and when it locks itself. */
export default function DeviceFields({ register, errors }: Pick<FormComponentProps, 'register' | 'errors'>) {
  return (
    <>
      <Input label="Terminal name" dir="auto" required autoFocus placeholder="e.g. Counter 1" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Lock after this many seconds without a tap" type="number" inputMode="numeric" min={30} max={3600} {...register('idleLockSeconds')} error={fieldError(errors, 'idleLockSeconds')} />
      <Toggle label="Lock after every order (the next person types their PIN)" {...register('lockAfterOrder')} />
    </>
  );
}
