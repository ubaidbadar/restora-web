import useAuthStore from '../store/auth_store';
import type OutboxItem from '../types/outbox_item';

/** An offline operation is only visible and replayable in the account/branch that created it. */
export default function belongsToCurrentWorkplace(item: Pick<OutboxItem, 'scope'>): boolean {
  const me = useAuthStore.getState().me;
  const workplace = me?.workplace;
  return !!(item.scope && me?.user?.id && workplace?.restaurant?._id &&
    item.scope.userId === me.user.id &&
    item.scope.restaurantId === workplace.restaurant._id &&
    item.scope.branchId === (workplace.branch?._id ?? ''));
}
