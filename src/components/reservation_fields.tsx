import type FormComponentProps from '../types/form_component_props';
import Input from '../ui/input';
import TableSelect from './table_select';
import Textarea from '../ui/textarea';
import fieldError from '../utils/field_error';

interface ReservationFieldsProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  /** Editing an existing booking: the guest cannot be changed, so phone and name are left out. */
  editing?: boolean;
}

export default function ReservationFields({ register, errors, editing = false }: ReservationFieldsProps) {
  return (
    <>
      {!editing && (
        <>
          <Input label="Mobile number" type="tel" inputMode="tel" placeholder="0300 1234567" required autoFocus {...register('phone')} error={fieldError(errors, 'phone')} />
          <Input label="Guest name" dir="auto" required {...register('name')} error={fieldError(errors, 'name')} />
        </>
      )}
      <Input label="How many people" inputMode="numeric" required {...register('partySize')} error={fieldError(errors, 'partySize')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" type="date" required {...register('date')} error={fieldError(errors, 'date')} />
        <Input label="Time" type="time" required {...register('time')} error={fieldError(errors, 'time')} />
      </div>
      <TableSelect register={register} errors={errors} />
      <Textarea label="Note (advance payment, occasion, seating)" dir="auto" rows={3} className="min-h-0" placeholder="Rs 5,000 advance paid by JazzCash. Iftar, family hall." {...register('note')} />
    </>
  );
}
