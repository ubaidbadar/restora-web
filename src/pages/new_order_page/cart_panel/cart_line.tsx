import QtyStepper from '../../../components/qty_stepper';
import Can from '../../../components/can';
import Input from '../../../ui/input';
import type FormComponentProps from '../../../types/form_component_props';
import fieldError from '../../../utils/field_error';
import type CartItem from '../../../types/cart_item';
import formatRs from '../../../utils/format_rs';
import lineDetails from '../../../utils/line_details';

interface CartLineProps {
  line: CartItem;
  onQty: (key: string, qty: number) => void;
  index: number;
  register: FormComponentProps['register'];
  errors: FormComponentProps['errors'];
}

export default function CartLine({ line, onQty, index, register, errors }: CartLineProps) {
  const details = lineDetails(line);
  const unitPrice = line.priceOverride ?? line.price;
  return (
    <li className="flex items-center justify-between gap-2 py-1.5 overflow-hidden">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink"><bdi>{line.name}</bdi></span>
        {details && <span className="block truncate text-sm text-body">{details}</span>}
        {line.note && <span dir="auto" className="block truncate text-sm text-muted italic">“{line.note}”</span>}
        <span className="text-sm tabular-nums text-muted">{formatRs(unitPrice)} each · {formatRs(unitPrice * line.qty)}</span>
        {line.menuPrice !== undefined && line.menuPrice !== unitPrice && <span className="block text-xs text-muted">Menu price: {formatRs(line.menuPrice)}</span>}
      </span>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Can permission="orders:price_override">
          <Input
            label="New unit price (Rs)"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder={String(unitPrice)}
            className="w-28"
            {...register(`items.${index}.priceOverride`, { setValueAs: (value) => value === '' ? undefined : Number(value) })}
            error={fieldError(errors, `items.${index}.priceOverride`)}
          />
        </Can>
        <QtyStepper itemId={line.key} name={line.name} qty={line.qty} onChange={onQty} />
      </div>
    </li>
  );
}
