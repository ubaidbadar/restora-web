import can from '@shared/can';
import api from '../../../config/api';
import Badge from '../../../ui/badge';
import type MenuItem from '../../../types/menu_item';
import Toggle from '../../../ui/toggle';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';
import useWorkplace from '../../../hooks/useWorkplace';

interface StockToggleProps {
  dish: MenuItem;
  onSaved: (dish: MenuItem) => void;
}

/** "In stock" in the active branch only (menu:stock). Shows the saved value: it moves once the server says so. */
export default function StockToggle({ dish, onSaved }: StockToggleProps) {
  const workplace = useWorkplace();
  const branch = workplace?.branch ?? { name: 'this branch' };
  const setInStock = (inStock: boolean) => {
    api
      .patch(`/menu/items/${dish._id}/stock`, { soldOut: !inStock })
      .then((res) => {
        onSaved(res.data);
        toast.success(inStock ? `${dish.name} is back in ${branch.name}` : `${dish.name} marked sold out in ${branch.name}`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  // Without the right to change it, the state is just shown.
  if (!can(workplace, 'menu:stock')) return dish.soldOut ? <Badge variant="neutral">Sold out</Badge> : null;
  return (
    <Toggle
      aria-label={`${dish.name} in stock at ${branch.name}`}
      title={`In stock at ${branch.name}`}
      checked={!dish.soldOut}
      className="min-h-11 justify-center px-2"
      onChange={(event) => setInStock(event.target.checked)}
    />
  );
}
