import useOutboxStore from '../../store/outbox_store';
import belongsToCurrentWorkplace from '../../utils/belongs_to_current_workplace';

/** How many changes made without internet still wait to be sent; nothing when none do. */
export default function WaitingCount() {
  const count = useOutboxStore((state) => state.items.filter(belongsToCurrentWorkplace).length);
  if (!count) return null;
  return <span className="font-semibold">{count === 1 ? '1 change waiting to sync' : `${count} changes waiting to sync`}</span>;
}
