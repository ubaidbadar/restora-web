import { useNavigate } from 'react-router';
import { CheckCircle2, ChefHat, FileText, MoreHorizontal, Pencil, Receipt, X } from 'lucide-react';
import can from '@shared/can';
import useWorkplace from '../../hooks/useWorkplace';
import type Order from '../../types/order';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';
import printSlip from '../../utils/print_slip';
import nextOrderStatus from '../../utils/next_order_status';

interface OrderActionsMenuProps {
  order: Order;
  onShowDetails: () => void;
  onMarkComplete: () => void;
  onCancel: () => void;
  /** The list has no primary status button, so keep completion available in its menu too. */
  showCompletionAction?: boolean;
}

/** The same available order actions wherever an order is shown. */
export default function OrderActionsMenu({ order, onShowDetails, onMarkComplete, onCancel, showCompletionAction = false }: OrderActionsMenuProps) {
  const navigate = useNavigate();
  const workplace = useWorkplace();
  const canMove = can(workplace, 'orders:update');
  const canCancel = can(workplace, 'orders:cancel');
  const pending = order.status === 'pending';
  const active = order.status !== 'completed' && order.status !== 'cancelled';
  const next = canMove ? nextOrderStatus(order) : null;
  const editable = canMove && active && order.status !== 'out_for_delivery' && order.paymentStatus === 'unpaid';

  return (
    <DropdownMenu
      trigger={(isOpen) => (
        <IconButton
          icon={MoreHorizontal}
          variant="ghost"
          aria-label={`More for order ${order.dailyToken}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        />
      )}
      items={[
        { label: 'Details', icon: FileText, onClick: onShowDetails },
        { label: 'Print kitchen slip', icon: ChefHat, onClick: () => printSlip(order, 'kitchen') },
        { label: 'Print receipt', icon: Receipt, onClick: () => printSlip(order, 'receipt') },
        ...(canMove && active && !pending && (showCompletionAction || next !== 'completed') ? [{ label: 'Mark as complete', icon: CheckCircle2, onClick: onMarkComplete }] : []),
        ...(editable ? [{ label: 'Edit order', icon: Pencil, onClick: () => navigate(`/orders/${order._id}/edit`) }] : []),
        ...(canCancel && active && !pending ? [{ label: 'Cancel order', icon: X, danger: true, onClick: onCancel }] : []),
      ]}
    />
  );
}
