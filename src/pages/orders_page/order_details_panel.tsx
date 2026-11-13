import { X } from 'lucide-react';
import type Order from '../../types/order';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';
import IconButton from '../../ui/icon_button';
import OrderView from '../../components/order_view';

interface OrderDetailsPanelProps {
  order: Order;
}

/** A persistent desktop companion to the board; selecting a different order updates this panel in place. */
export default function OrderDetailsPanel({ order }: OrderDetailsPanelProps) {
  const setPreferences = useOrdersWorkspaceStore((state) => state.setPreferences);
  return (
    <aside
      aria-label={`Details for order ${order.dailyToken}`}
      className="sticky top-4 max-h-[calc(100dvh-2rem)] min-w-0 overflow-y-auto rounded-card bg-surface p-4 shadow-card"
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Selected order</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Order #{order.dailyToken}</h2>
        </div>
        <IconButton icon={X} variant="ghost" size="sm" aria-label="Close order details panel" onClick={() => setPreferences({ detailsPanel: false })} />
      </div>
      <OrderView order={order} />
    </aside>
  );
}
