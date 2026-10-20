import can from '@shared/can';
import type Permission from '@shared/permission';
import useWorkplace from './useWorkplace';

/** May the person do this here? For showing and hiding; the server checks again. */
export default function useCan(permission: Permission) {
  return can(useWorkplace(), permission);
}
