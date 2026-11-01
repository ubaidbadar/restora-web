import type OrderRow from '../../../types/order_row';
import Drawer from '../../../ui/drawer/modal';
import OrderRowLine from '../order_row_line';
import OrderView from '../../../components/order_view';

/** A row of the list; a tap opens the whole order in a drawer. */
export default function HistoryOrderDrawer({ order, showDay }: { order: OrderRow; showDay: boolean }) {
  return (
    <Drawer title={`Order #${order.dailyToken}`} component={({ open }) => <OrderRowLine order={order} showDay={showDay} onClick={open} />}>
      <OrderView order={order} />
    </Drawer>
  );
}
