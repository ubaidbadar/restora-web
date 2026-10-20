import { Bike, MapPin } from 'lucide-react';
import type Order from '../../types/order';
import formatRs from '../../utils/format_rs';

interface DeliveryInfoProps {
  order: Order;
}

export default function DeliveryInfo({ order }: DeliveryInfoProps) {
  // Cash the rider still has to collect at the door.
  const cod = order.type === 'delivery' && order.paymentStatus === 'unpaid' ? order.total : 0;

  return (
    <div className="flex flex-col gap-1 rounded-control bg-sunken px-2.5 py-2 text-sm text-body">
      <p dir="auto" className="flex items-start gap-1">
        <MapPin size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
        <span className="sr-only">Deliver to:</span>
        {[order.area, order.address].filter(Boolean).join(', ') || 'No address yet'}
      </p>
      <p dir="auto" className="flex items-center gap-1">
        <Bike size={16} className="shrink-0 text-muted" aria-hidden="true" />
        <span className="sr-only">Rider:</span>
        {order.rider || 'No rider yet'}
      </p>
      <p className="font-semibold tabular-nums text-ink">{cod > 0 ? `Collect ${formatRs(cod)} cash` : 'Nothing to collect'}</p>
    </div>
  );
}
