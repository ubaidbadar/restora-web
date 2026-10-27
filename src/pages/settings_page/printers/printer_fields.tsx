import type FormComponentProps from '../../../types/form_component_props';
import type MenuCategory from '../../../types/menu_category';
import Checkbox from '../../../ui/checkbox';
import Input from '../../../ui/input';
import Select from '../../../ui/select';
import fieldError from '../../../utils/field_error';
import PrinterCategories from './printer_categories';

interface PrinterFieldsProps extends FormComponentProps {
  categories: MenuCategory[];
}

const WIDTHS = [
  { value: '48', label: '80 mm roll' },
  { value: '32', label: '58 mm roll' },
];

/** What staff call a printer, what it prints, and the paper it has. */
export default function PrinterFields({ categories, ...form }: PrinterFieldsProps) {
  const { register, errors, control } = form;
  return (
    <>
      <Input label="Name" dir="auto" required autoFocus placeholder="e.g. Kitchen, Bar, Counter" {...register('label')} error={fieldError(errors, 'label')} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-ink">Prints</legend>
        <Checkbox label="Kitchen slips" value="kitchen" {...register('prints')} />
        <Checkbox label="Customer receipts" value="receipt" {...register('prints')} />
      </fieldset>
      <PrinterCategories register={register} control={control} categories={categories} />
      <Select label="Paper" options={WIDTHS} {...register('width')} />
      <Input label="Copies" type="number" inputMode="numeric" min={1} max={5} {...register('copies')} error={fieldError(errors, 'copies')} />
    </>
  );
}
