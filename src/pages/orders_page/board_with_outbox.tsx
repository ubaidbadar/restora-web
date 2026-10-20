import { ClipboardList, Plus } from 'lucide-react';
import { Link } from 'react-router';
import EmptyState from '../../components/empty_state';
import useOutboxStore from '../../store/outbox_store';
import type Order from '../../types/order';
import withOutbox from '../../utils/with_outbox';
import Button from '../../ui/button';
import BoardColumns from './board_columns';

interface BoardWithOutboxProps {
  orders: Order[];
  onOrderUpdated: (order: Order) => void;
}

/**
 * The board as the server last sent it, with what still waits in this device's outbox laid on top (utils/with_outbox).
 * So a refresh from the server never hides work done offline; it simply drops out of the outbox once it is sent.
 */
export default function BoardWithOutbox({ orders, onOrderUpdated }: BoardWithOutboxProps) {
  const items = useOutboxStore((state) => state.items);
  // `items` is read so the board updates as the outbox changes; withOutbox reads the outbox itself.
  const shown = items.length ? withOutbox(orders) : orders;

  if (!shown.length) {
    return (
      <EmptyState icon={ClipboardList} title="No orders today yet" text="Orders you place show here, from new to served and paid.">
        <Button as={Link} to="/orders/new" icon={Plus}>
          New order
        </Button>
      </EmptyState>
    );
  }
  return <BoardColumns orders={shown} onOrderUpdated={onOrderUpdated} />;
}
