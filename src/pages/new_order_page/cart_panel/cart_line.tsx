import QtyStepper from '../../../components/qty_stepper';
import Input from '../../../ui/input';
import type CartItem from '../../../types/cart_item';
import formatRs from '../../../utils/format_rs';
import lineDetails from '../../../utils/line_details';

interface CartLineProps {
  line: CartItem;
  onQty: (key: string, qty: number) => void;
  onPrice: (key: string, price: number) => void;
}

/** One order line: quantity and unit price belong to this order, never to the menu dish. */
export default function CartLine({ line, onQty, onPrice }: CartLineProps) {
  const details = lineDetails(line);
  const menuPrice = line.menuPrice ?? line.price;
  const priceOverridden = line.price !== menuPrice;

  return (
    <li className="flex items-center justify-between gap-2 overflow-hidden py-2">
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink"><bdi>{line.name}</bdi></span>
        {details && <span className="block truncate text-sm text-body">{details}</span>}
        {line.note && <span dir="auto" className="block truncate text-sm text-muted italic">“{line.note}”</span>}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Unit price</span>
          <Input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={line.price}
            aria-label={`Unit price for ${line.name}`}
            className="w-24! min-h-9! px-2! py-1! text-end text-sm"
            onChange={(event) => onPrice(line.key, Math.max(0, Number(event.currentTarget.value) || 0))}
          />
          {priceOverridden && <span className="text-xs text-muted">Menu price {formatRs(menuPrice)}</span>}
        </div>
        <span className="mt-1 block text-sm tabular-nums text-muted">Line total {formatRs(line.price * line.qty)}</span>
      </div>
      <QtyStepper itemId={line.key} name={line.name} qty={line.qty} onChange={onQty} />
    </li>
  );
}
