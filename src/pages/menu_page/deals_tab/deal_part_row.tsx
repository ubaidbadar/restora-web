import { Trash2 } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type MenuItem from '../../../types/menu_item';
import IconButton from '../../../ui/icon_button';
import Input from '../../../ui/input';
import Select from '../../../ui/select';
import fieldError from '../../../utils/field_error';

interface DealPartRowProps extends Pick<FormComponentProps, 'control' | 'register' | 'errors' | 'setValue'> {
  index: number;
  /** The dishes a deal can hold (not deals). */
  dishes: MenuItem[];
  onRemove?: () => void;
}

/** One dish in the deal: which, its size when it has several, and how many. */
export default function DealPartRow({ index, dishes, onRemove, control, register, errors, setValue }: DealPartRowProps) {
  const itemId: string = useWatch({ control, name: `includes.${index}.itemId` });
  const sizes = dishes.find((dish) => dish._id === itemId)?.sizes ?? [];

  return (
    <div className="grid grid-cols-[1fr_4.5rem_2.5rem] items-start gap-2">
      <div className="flex flex-col gap-2">
        <Select
          aria-label={`Dish ${index + 1}`}
          placeholder="Pick a dish"
          options={dishes.map((dish) => ({ value: dish._id, label: dish.hidden ? `${dish.name} (hidden)` : dish.name }))}
          {...register(`includes.${index}.itemId`, { onChange: () => setValue(`includes.${index}.sizeId`, '') })}
          error={fieldError(errors, `includes.${index}.itemId`)}
        />
        {sizes.length > 1 && (
          <Select aria-label={`Dish ${index + 1} size`} options={sizes.map((size) => ({ value: size._id, label: size.name }))} {...register(`includes.${index}.sizeId`)} />
        )}
      </div>
      <Input aria-label={`Dish ${index + 1} how many`} inputMode="numeric" {...register(`includes.${index}.qty`)} error={fieldError(errors, `includes.${index}.qty`)} />
      <IconButton type="button" icon={Trash2} aria-label={`Remove dish ${index + 1}`} className="mt-0.5" disabled={!onRemove} onClick={onRemove} />
    </div>
  );
}
