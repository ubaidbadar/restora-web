import QtyStepper from '../../../components/qty_stepper';
import Input from '../../../ui/input';
import type CartItem from '../../../types/cart_item';
import formatRs from '../../../utils/format_rs';
import lineDetails from '../../../utils/line_details';

interface CartLineProps {
  line: CartItem;
  onQty: (key: string, qty: number) => void;
  onPrice: (key: string, price: number) => void;
  canChangePrice: boolean;
}

/** One order line: quantity and unit price belong to this order, never to the menu dish. */
export default function CartLine({ line, onQty, onPrice, canChangePrice }: CartLineProps) {
  const details = lineDetails(line);
  const menuPrice = line.menuPrice ?? line.price;
  const priceOverridden = line.priceOverridden ?? (line.price !== menuPrice);

  return (
    <li className="min-w-0 py-3">
      <span className="block break-words text-sm font-semibold leading-5 text-ink"><bdi>{line.name}</bdi></span>
      {details && <span className="mt-0.5 block text-xs text-body">{details}</span>}
      {line.note && <span dir="auto" className="mt-0.5 block text-xs text-muted italic">“{line.note}”</span>}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs text-muted">Unit price</span>
          {canChangePrice ? (
            <Input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={line.price}
              aria-label={`Unit price for ${line.name}`}
              className="w-20! min-h-9! px-2! py-1! text-end text-sm tabular-nums"
              onChange={(event) => onPrice(line.key, Math.max(0, Number(event.currentTarget.value) || 0))}
            />
          ) : (
            <span className="text-sm tabular-nums text-body">{formatRs(line.price)}</span>
          )}
        </div>
        <QtyStepper itemId={line.key} name={line.name} qty={line.qty} onChange={onQty} />
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs">
        {priceOverridden && <span className="text-muted">Menu price {formatRs(menuPrice)}</span>}
        <span className="ms-auto text-muted">
          Total <strong className="font-semibold tabular-nums text-ink">{formatRs(line.price * line.qty)}</strong>
        </span>
      </div>
    </li>
  );
}
