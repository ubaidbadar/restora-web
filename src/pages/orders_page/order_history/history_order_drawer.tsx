import type OrderRow from '../../../types/order_row';
import Drawer from '../../../ui/drawer/modal';
import OrderRowLine from '../order_row_line';
import HistoryOrderDetails from './history_order_details';

interface HistoryOrderDrawerProps {
  order: OrderRow;
  showDay: boolean;
  onSelect?: () => void;
  selected?: boolean;
}

/** A historical row; in desktop split mode it selects the side panel, otherwise it opens a drawer. */
export default function HistoryOrderDrawer({ order, showDay, onSelect, selected = false }: HistoryOrderDrawerProps) {
  if (onSelect) return <OrderRowLine order={order} showDay={showDay} selected={selected} onClick={onSelect} />;
  return (
    <Drawer title={`Order #${order.dailyToken}`} component={({ open }) => <OrderRowLine order={order} showDay={showDay} onClick={open} />}>
      <HistoryOrderDetails id={order._id} />
    </Drawer>
  );
}
