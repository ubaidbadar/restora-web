import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type MenuCategory from '../../../types/menu_category';
import Checkbox from '../../../ui/checkbox';

interface PrinterCategoriesProps extends Pick<FormComponentProps, 'register' | 'control'> {
  categories: MenuCategory[];
}

/** For a kitchen printer: which menu categories it prints. None ticked means every dish. */
export default function PrinterCategories({ register, control, categories }: PrinterCategoriesProps) {
  const prints: string[] = useWatch({ control, name: 'prints' }) ?? [];
  if (!prints.includes('kitchen') || !categories.length) return null;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-ink">Only these categories</legend>
      <p className="text-sm text-muted">Leave all empty to print every dish. Tick Drinks on the bar printer, for example.</p>
      {categories.map((category) => (
        <Checkbox key={category._id} label={category.name} value={category._id} {...register('categoryIds')} />
      ))}
    </fieldset>
  );
}
