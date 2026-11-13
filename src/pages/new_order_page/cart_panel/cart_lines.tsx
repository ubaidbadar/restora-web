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
      <p role={error ? 'alert' : undefined} className={`py-4 text-sm ${error ? 'text-danger-700' : 'text-muted'}`}>
        {error ?? 'Tap a dish to add it.'}
      </p>
    );
  }

  return (
    <ul aria-label="Items in this order" className="divide-y divide-border">
      {items.map((line) => (
        <CartLine key={line.key} line={line} onQty={(key, qty) => setValue('items', setQty(items, key, qty), { shouldDirty: true })} />
      ))}
    </ul>
  );
}
