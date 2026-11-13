import { ShoppingBasket } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type CartItem from '../../../types/cart_item';
import fieldError from '../../../utils/field_error';
import setQty from '../../../utils/set_qty';
import CartLine from './cart_line';

/** The lines in the cart. Reads `items` from the form and writes quantity changes back with setValue. */
export default function CartLines({ control, setValue, errors }: FormComponentProps) {
  const items: CartItem[] = useWatch({ control, name: 'items' }) ?? [];
  const error = fieldError(errors, 'items');

  if (items.length === 0) {
    return (
      <p role={error ? 'alert' : undefined} className={`rounded-control flex flex-1 items-center justify-center gap-2 border border-dashed px-3 py-5 text-sm xl:flex-none xl:justify-start xl:py-3 ${error ? 'border-danger-300 text-danger-700' : 'border-border-strong text-muted'}`}>
        <ShoppingBasket className="hidden size-4 shrink-0 xl:block" aria-hidden="true" />
        <span>{error ?? 'Choose a dish from the menu to start this order.'}</span>
      </p>
    );
  }

  return (
    <div className='xl:border-dashed xl:border xl:px-4 xl:py-2 xl:flex-1 md:overflow-auto border-border-strong rounded-control'>
      <ul aria-label="Items in this order" className="divide-y divide-border">
        {items.map((line) => (
          <CartLine key={line.key} line={line} onQty={(key, qty) => setValue('items', setQty(items, key, qty), { shouldDirty: true })} />
        ))}
      </ul>
    </div>
  );
}
