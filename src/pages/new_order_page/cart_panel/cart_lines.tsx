import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type CartItem from '../../../types/cart_item';
import fieldError from '../../../utils/field_error';
import setQty from '../../../utils/set_qty';
import CartLine from './cart_line';

interface CartLinesProps extends FormComponentProps {
  centerEmpty?: boolean;
  className?: string;
}

/** The lines in the cart. Reads `items` from the form and writes quantity changes back with setValue. */
export default function CartLines({ control, setValue, errors, centerEmpty = false, className }: CartLinesProps) {
  const items: CartItem[] = useWatch({ control, name: 'items' }) ?? [];
  const error = fieldError(errors, 'items');

  if (items.length === 0) {
    return (
      <div className={className || (centerEmpty ? 'flex min-h-0 flex-1 items-center justify-center' : 'py-4')}>
        <p role={error ? 'alert' : undefined} className={`text-sm ${error ? 'text-danger-700' : 'text-muted'}`}>
          {error ?? 'Tap a dish to add it.'}
        </p>
      </div>
    );
  }

  return (
    <ul aria-label="Items in this order" className={className || 'divide-y divide-border'}>
      {items.map((line) => (
        <CartLine key={line.key} line={line} onQty={(key, qty) => setValue('items', setQty(items, key, qty), { shouldDirty: true })} />
      ))}
    </ul>
  );
}
