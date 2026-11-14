import type Permission from '@shared/permission';

/** Declarative requirements attached to a route or a pathless route group. */
export default interface RouteAccess {
  guestOnly?: boolean;
  auth?: boolean;
  web?: boolean;
  restaurant?: boolean;
  setup?: boolean;
  permission?: Permission;
  permissionRedirect?: string;
}
