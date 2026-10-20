import type FormComponentProps from '../../types/form_component_props';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';

export default function BatchFields({ register, errors, sections }: Pick<FormComponentProps, 'register' | 'errors'> & { sections: string[] }) {
  return (
    <>
      <p className="text-sm text-muted">For example T, 1 to 20 adds T1, T2 … T20. Names this branch already has are skipped.</p>
      <Input label="Name starts with" placeholder="e.g. T" autoFocus {...register('prefix')} error={fieldError(errors, 'prefix')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="From number" inputMode="numeric" required {...register('from')} error={fieldError(errors, 'from')} />
        <Input label="To number" inputMode="numeric" required {...register('to')} error={fieldError(errors, 'to')} />
      </div>
      <Input label="Section (optional)" list="table-sections" placeholder="e.g. Hall" {...register('section')} error={fieldError(errors, 'section')} />
      <datalist id="table-sections">
        {sections.map((section) => (
          <option key={section} value={section} />
        ))}
      </datalist>
      <Input label="Seats at each (optional)" inputMode="numeric" {...register('seats')} error={fieldError(errors, 'seats')} />
    </>
  );
}
