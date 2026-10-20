import type PERMISSION_CATALOG from './permission_catalog';

/** One thing a role may do, as `resource:action`. */
type Permission = (typeof PERMISSION_CATALOG)[number]['permission'];

export type { Permission as default };
