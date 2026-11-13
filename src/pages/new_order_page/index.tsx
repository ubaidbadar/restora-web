import type { KeyboardEvent } from 'react';
import DockedSheet from '../../ui/docked_sheet';
import ORDER_FORM from '../../constants/order_form';
import CartBar from './cart_bar';
import { useNavigate, useSearchParams } from 'react-router';
import useAuthStore from '../../store/auth_store';
import useRestaurantSettings from '../../hooks/useRestaurantSettings';
import lockTerminal from '../../utils/lock_terminal';
import api from '../../config/api';
import toast from '../../utils/toast';
import printSlip from '../../utils/print_slip';
import printOnThisPc from '../../utils/print_on_this_pc';
import kitchenChanges from '../../utils/kitchen_changes';
import PageHeader from '../../components/page_header';
import useNewOrderWorkspaceStore from '../../store/new_order_workspace_store';
import type NewOrderWorkspaceState from '../../types/new_order_workspace_state';
import CartPanel from './cart_panel';
import CustomerStep from './customer_step';
import MenuPicker from './menu_picker';
import PlaceOrderBar from './place_order_bar';
import WorkspaceSettings from './workspace_settings';
import Form from '../../ui/form';
import type FormComponentProps from '../../types/form_component_props';
import orderSchema from './schema';
import type { FieldValues } from 'react-hook-form';
import getCache from '../../store/get_cache';
import useOutboxStore from '../../store/outbox_store';
import type Customer from '../../types/customer';
import type Order from '../../types/order';
import type CartItem from '../../types/cart_item';
import calcTotals from '../../utils/calc_totals';
import dayKey from '../../utils/day_key';
import syncOutbox from '../../utils/sync_outbox';
import ownOrders from '../../utils/own_orders';
import upsertById from '../../utils/upsert_by_id';

/**
 * The number an order taken offline shows until the server gives it a token: this device's letter and a count for
 * the day, e.g. "A-3". Each device keeps its own letter, so two offline tablets never show the same number.
 */
function offlineToken() {
  try {
    let letter = localStorage.getItem('restora-device-letter');
    if (!letter) localStorage.setItem('restora-device-letter', (letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))));
    const key = `restora-offline-count-${dayKey()}`;
    const count = Number(localStorage.getItem(key) ?? 0) + 1;
    localStorage.setItem(key, String(count));
    return `${letter}-${count}`;
  } catch {
    return `X-${Date.now() % 1000}`;
  }
}

/** The order as the board shows it while it waits to sync, worked out on this device from the form and the menu prices. */
function offlineOrder(data: FieldValues, clientId: string, token: string): Order {
  const me = useAuthStore.getState().me!;
  const method = data.paymentStatus === 'unpaid' ? undefined : data.paymentMethod;
  const rates: Record<string, number> = me.workplace!.settings.taxByPaymentMethod;
  const taxRate = method ? (rates[method] ?? 0) : 0;
  const deliveryFee = data.type === 'delivery' ? data.deliveryFee : 0;
  const saved = (getCache.get(getCache.keyOf('/customers')) as Customer[] | undefined)?.find((customer) => customer._id === data.customerId);
  const name = saved?.name ?? data.newName;
  return {
    _id: clientId,
    dailyToken: token,
    branchId: me.workplace!.branch?._id ?? '',
    customerId: data.customerId,
    customer: name ? { _id: data.customerId ?? '', name, phone: saved?.phone ?? data.newPhone ?? '' } : undefined,
    type: data.type,
    status: 'new',
    items: data.items,
    ...calcTotals(data.items, data.discount, taxRate, deliveryFee),
    taxRate,
    deliveryFee,
    paymentMethod: method,
    paymentStatus: data.paymentStatus,
    tableId: data.tableId,
    tableName: data.tableName,
    area: data.area,
    address: data.address,
    rider: data.rider,
    takenBy: me.user.name,
    createdAt: new Date().toISOString(),
    pendingSync: true,
  };
}

const keepEnterInInputs = (e: KeyboardEvent<HTMLFormElement>) => {
  if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault();
};

/** A placed order being changed, and its lines as cart lines (pages/edit_order_page). */
interface Editing {
  order: Order;
  items: CartItem[];
}

/** The customer whose profile the order was started from (`?customer=<id>`): already loaded by that page. */
const startingCustomer = (id: string | null) => (id ? (getCache.get(getCache.keyOf(`/customers/${id}`)) as Customer | undefined) : undefined);

const Main = ({ editing, workspace, ...props }: FormComponentProps & { editing?: Editing; workspace: Pick<NewOrderWorkspaceState, 'orderPanel' | 'menuDensity'> }) => {
  const order = editing?.order;
  const fromProfile = startingCustomer(useSearchParams()[0].get('customer'));
  // Tax by payment method comes with /me: no request of its own.
  const { taxByPaymentMethod } = useRestaurantSettings();

  return (
    <>
      <div className={`min-w-0 w-full ${workspace.orderPanel === 'column' ? 'lg:pe-96' : ''}`}>
        {/* The bottom bar is hidden on this page below the sidebar width, so it gets its own way back. */}
        <div className="flex gap-1">
          {order ? (
            <PageHeader backTo='/orders' title={`Edit order #${order.dailyToken}`} subtitle="Change the dishes, type or customer. Payment is recorded from the board.">
              <WorkspaceSettings />
            </PageHeader>
          ) : (
            <PageHeader backTo='/orders' title="New order" subtitle="Find the customer, tap dishes, place the order">
              <WorkspaceSettings />
            </PageHeader>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <CustomerStep {...props} picked={order?.customer ?? (fromProfile && { _id: fromProfile._id, name: fromProfile.name, phone: fromProfile.phone })} />
          <MenuPicker {...props} menuDensity={workspace.menuDensity} />
        </div>
      </div>

      {/* Beside the menu from tablet width; on phones a bottom sheet, opened from the cart bar. */}
      <DockedSheet
        label="Order"
        mode={workspace.orderPanel}
        component={({ open }) => <CartBar control={props.control} taxByPaymentMethod={taxByPaymentMethod} showEmpty={Boolean(order)} onOpen={open} />}
      >
        <CartPanel {...props} taxByPaymentMethod={taxByPaymentMethod} editing={Boolean(order)} />
        <PlaceOrderBar {...props} taxByPaymentMethod={taxByPaymentMethod} submitLabel={order ? 'Save changes' : 'Place order'} />
      </DockedSheet>
    </>
  );
};

export default function NewOrderPage({ editing }: { editing?: Editing }) {
  const navigate = useNavigate();
  const order = editing?.order;
  const fromProfile = startingCustomer(useSearchParams()[0].get('customer'));
  const workspace = useNewOrderWorkspaceStore();

  return (
    <>
      <Form
        className="flex items-end md:justify-end"
        id={ORDER_FORM}
        component={(props) => <Main {...props} editing={editing} workspace={workspace} />}
        schema={orderSchema}
        defaultValues={
          order && {
            customerId: order.customerId,
            items: editing.items,
            type: order.type,
            tableId: order.tableId,
            tableName: order.tableName,
            area: order.area,
            address: order.address,
            rider: order.rider,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            paymentStatus: 'unpaid',
          } || {
            // Pay later until someone picks otherwise; people who can't take payments never see the choice.
            paymentStatus: 'unpaid',
            customerId: fromProfile?._id,
          }
        }
        noValidate
        onKeyDown={(e) => keepEnterInInputs(e)}
        onSubmit={({ data, onSuccess, onError }) => {
          // Editing: payment is left out (it is recorded from the board).
          if (order) {
            const { paymentStatus: _status, paymentMethod: _method, ...changes } = data;
            const token = order.dailyToken;
            const done = (message: string, saved: Order) => {
              onSuccess('');
              toast.success(message, { label: 'Print slip', onClick: () => printSlip(saved, 'kitchen') });
              navigate('/orders');
            };
            // The order as the board will show it, worked out here from the form and the menu prices.
            const worked = offlineOrder(data, order._id, String(token));
            // The customer list may not be loaded: an unchanged customer keeps the name the order already has.
            const local = { ...worked, customer: worked.customer ?? (data.customerId && data.customerId === order.customerId ? order.customer : undefined) };
            const outbox = useOutboxStore.getState();
            const waitingOrder = outbox.items.find((item) => item.id === order._id && item.url === '/orders');
            // Taken offline and not sent yet: change the waiting order itself, so the server only ever gets the final one.
            if (waitingOrder) {
              const preview = { ...local, dailyToken: token, createdAt: order.createdAt, takenBy: order.takenBy };
              outbox.replace(order._id, { body: { ...(waitingOrder.body as object), ...changes }, preview });
              // The server only ever sees the final order, so it prints no "CHANGED" slip: this PC prints what changed.
              const items = kitchenChanges((waitingOrder.preview as Order).items, preview.items);
              if (items.length) void printOnThisPc({ ...preview, dailyToken: `${token} CHANGED`, items }, 'kitchen', `${order._id}~edit-${Date.now().toString(36)}`);
              return done(`Order ${token} changed. It will be sent when the internet is back.`, preview);
            }
            // No internet: the edit waits in the outbox and the board shows it at once.
            const queue = () => {
              const { customerId, customer, type, items, subtotal, discount, tax, taxRate, total, deliveryFee, tableId, tableName, area, address, rider } = local;
              const preview = { customerId, customer, type, items, subtotal, discount, tax, taxRate, total, deliveryFee, tableId, tableName, area, address, rider };
              useOutboxStore.getState().add({ id: `${order._id}-edit-${Date.now().toString(36)}`, method: 'put', url: `/orders/${order._id}`, body: changes, label: `Changes to order #${token}`, createdAt: new Date().toISOString(), preview });
              done(`Order #${token} changed. It will be sent when the internet is back.`, { ...order, ...preview });
            };
            // Changes already waiting for this order go first, so this one waits behind them.
            const behind = outbox.items.some((item) => item.url.startsWith(`/orders/${order._id}`));
            if (!outbox.online || behind) return queue();
            return void api
              .put(`/orders/${order._id}`, changes)
              .then((res) => {
                getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => list?.map((item) => (item._id === res.data._id ? res.data : item)));
                getCache.set(getCache.keyOf(`/orders/${order._id}`), res.data);
                done(`Order #${res.data.dailyToken} updated`, res.data);
              })
              .catch((err) => (err.response ? onError(err) : (queue(), void syncOutbox())));
          }
          // Made here, so the order is saved once however many times it is sent (offline, or a retry).
          const clientId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
          const body = { ...data, clientId, placedAt: new Date().toISOString() };
          ownOrders.add(clientId);
          const finish = (message: string, print?: Order) => {
            onSuccess('');
            toast.success(message, print && { label: 'Print slip', onClick: () => printSlip(print, 'kitchen') });
            // A terminal set to lock after every order hands over to the next person.
            if (useAuthStore.getState().me?.device?.settings.lockAfterOrder) return lockTerminal();
            navigate('/orders');
          };
          // No internet: the order waits in the outbox with a device number, shows on the board, and is sent later.
          const saveOffline = () => {
            const token = offlineToken();
            const preview = offlineOrder(data, clientId, token);
            useOutboxStore.getState().add({ id: clientId, method: 'post', url: '/orders', body, label: `Order ${token}`, createdAt: body.placedAt, preview });
            // Online, the server queues the kitchen slip; offline, this PC's print agent prints it now. Keyed by the
            // clientId, as the server's slip is once the order syncs, so the kitchen gets it once.
            void printOnThisPc(preview, 'kitchen', clientId).then((printed) =>
              printed
                ? finish(`No internet. Order ${token} is saved on this device and its kitchen slip is printed.`)
                : finish(`No internet. Order ${token} is saved on this device. Its kitchen slip is not printed yet.`, preview)
            );
          };
          if (!useOutboxStore.getState().online) return saveOffline();
          api
            .post('/orders', body)
            .then((res) => {
              // The board may already have it, sent live by the server.
              getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => (list ? upsertById(list, res.data) : list));
              finish(`Order #${res.data?.dailyToken ?? ''} placed`);
            })
            .catch((err) => (err.response ? onError(err) : (saveOffline(), void syncOutbox())));
        }}
      />
    </>
  );
}
