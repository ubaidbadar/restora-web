import type Permission from './permission';
import type Workplace from './workplace';

/** May the person do this where they work now? The client uses it to show or hide things; the server checks again. */
export default function can(workplace: Workplace | null | undefined, permission: Permission): boolean {
  return Boolean(workplace?.permissions.includes(permission));
}
