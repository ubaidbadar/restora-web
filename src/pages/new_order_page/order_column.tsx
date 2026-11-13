import type FormComponentProps from '../../types/form_component_props';
import CartLines from './cart_panel/cart_lines';

/** The order's dishes live between the menu and checkout on wide screens. */
export default function OrderColumn(props: FormComponentProps) {
  return (
    <section aria-label="Order" className="hidden min-h-0 w-80 shrink-0 flex-col overflow-y-auto px-4 py-5 xl:flex">
      <h2 className="mb-4 text-heading text-ink">Order</h2>
      <CartLines {...props} />
    </section>
  );
}
