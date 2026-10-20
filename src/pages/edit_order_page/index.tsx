import { ClipboardX } from 'lucide-react';
import { useParams } from 'react-router';
import EmptyState from '../../components/empty_state';
import LoadFailed from '../../components/load_failed';
import SkeletonGrid from '../../components/skeleton_grid';
import useGet from '../../hooks/useGet';
import type CartItem from '../../types/cart_item';
import type Menu from '../../types/menu';
import type Order from '../../types/order';
import cartItemOf from '../../utils/cart_item_of';
import withOutbox from '../../utils/with_outbox';
import getCache from '../../store/get_cache';
import useOutboxStore from '../../store/outbox_store';
import NewOrderPage from '../new_order_page';

/** Statuses an order can still be edited in: until it is on the way or done (the server checks too). */
const EDITABLE = ['new', 'preparing', 'ready'];

/**
 * A placed order's lines as cart lines, matched to the menu by the size and add-on ids kept on the order (by name for
 * older orders that lack them). A dish no longer on the menu stays as it was; the server says so when saving.
 */
function cartOf(order: Order, menu: Menu): CartItem[] {
  const lines = new Map<string, CartItem>();
  order.items.forEach((line, index) => {
    const dish = menu.items.find((item) => item._id === line.itemId);
    const size = dish && (dish.sizes.find((s) => s._id === line.sizeId) ?? dish.sizes.find((s) => (s.name || undefined) === line.sizeName) ?? dish.sizes[0]);
    if (!dish || !size) {
      lines.set(`gone-${index}`, { ...line, key: `gone-${index}`, addonIds: line.addonIds ?? [] });
      return;
    }
    const options = menu.addonGroups.filter((group) => dish.addonGroupIds.includes(group._id)).flatMap((group) => group.options);
    const addons = line.addonIds
      ? options.filter((option) => line.addonIds!.includes(option._id))
      : options.filter((option) => line.addons?.some((addon) => addon.name === option.name));
    const cart = cartItemOf(dish, size, addons, line.note);
    // The same dish, size, add-ons and note twice is one line.
    const same = lines.get(cart.key);
    lines.set(cart.key, { ...cart, qty: (same?.qty ?? 0) + line.qty });
  });
  return [...lines.values()];
}

/** The New order screen, filled with a placed order to change it. */
export default function EditOrderPage() {
  const { id = '' } = useParams();
  // Read so the screen follows the outbox (an offline order syncing, a queued change).
  useOutboxStore((state) => state.items);
  const takenOffline = useOutboxStore.getState().items.some((item) => item.id === id && item.url === '/orders');
  // An order taken offline is not on the server yet, so it is not asked for.
  const fetched = useGet<Order>(`/orders/${id}`, { active: takenOffline });
  const menu = useGet<Menu>('/menu');
  // The board's copy with this device's waiting changes on top: what to edit offline, and the latest version online.
  const board = withOutbox(fetched.data ? [fetched.data] : ((getCache.get(getCache.keyOf('/orders')) as Order[] | undefined) ?? []));
  const savedId = useOutboxStore.getState().savedIds[id];
  const order = { data: board.find((item) => item._id === id || item._id === savedId) };

  if (!order.data || !menu.data) {
    if (fetched.loading || menu.loading) return <SkeletonGrid tiles={6} columns="grid-cols-2 sm:grid-cols-3" height="h-20" />;
    return <LoadFailed what={order.data ? 'the menu' : 'the order'} onRetry={() => (order.data ? menu.get() : fetched.get())} />;
  }
  if (!EDITABLE.includes(order.data.status) || order.data.paymentStatus !== 'unpaid') {
    return (
      <EmptyState
        icon={ClipboardX}
        title={`Order #${order.data.dailyToken} can't be changed`}
        text={order.data.paymentStatus !== 'unpaid' ? 'Its bill is settled. Place a new order for anything extra.' : 'It is on the way or done. Place a new order for anything extra.'}
      />
    );
  }
  return <NewOrderPage editing={{ order: order.data, items: cartOf(order.data, menu.data) }} />;
}
