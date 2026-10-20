import QtyStepper from '../../../components/qty_stepper';
import type CartItem from '../../../types/cart_item';
import formatRs from '../../../utils/format_rs';
import lineDetails from '../../../utils/line_details';

interface CartLineProps {
  line: CartItem;
  onQty: (key: string, qty: number) => void;
}

export default function CartLine({ line, onQty }: CartLineProps) {
  const details = lineDetails(line);
  return (
    <li className="flex items-center justify-between gap-2 py-1.5">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink"><bdi>{line.name}</bdi></span>
        {details && <span className="block truncate text-sm text-body">{details}</span>}
        {line.note && <span dir="auto" className="block truncate text-sm text-muted italic">“{line.note}”</span>}
        <span className="text-sm tabular-nums text-muted">{formatRs(line.price * line.qty)}</span>
      </span>
      <QtyStepper itemId={line.key} name={line.name} qty={line.qty} onChange={onQty} />
    </li>
  );
}
