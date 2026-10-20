import type Permission from './permission';

/** The five roles every restaurant starts with. Owner can do everything and is never edited; the others can be reset to these. */
const PRESET_ROLES: { key: string; name: string; permissions: Permission[] }[] = [
  { key: 'owner', name: 'Owner', permissions: [] },
  {
    key: 'manager',
    name: 'Manager',
    permissions: [
      'orders:view',
      'orders:create',
      'orders:update',
      'orders:payment',
      'orders:discount',
      'orders:cancel',
      'customers:view',
      'customers:manage',
      'customers:khata',
      'customers:import',
      'reservations:view',
      'reservations:manage',
      'tables:view',
      'tables:manage',
      'menu:view',
      'menu:update',
      'menu:stock',
      'reports:view',
      'staff:view',
      'staff:invite',
      'devices:manage',
    ],
  },
  {
    key: 'cashier',
    name: 'Cashier',
    permissions: [
      'orders:view',
      'orders:create',
      'orders:update',
      'orders:payment',
      'customers:view',
      'customers:manage',
      'customers:khata',
      'reservations:view',
      'tables:view',
      'menu:view',
    ],
  },
  {
    key: 'waiter',
    name: 'Waiter',
    permissions: ['orders:view', 'orders:create', 'customers:view', 'reservations:view', 'tables:view', 'menu:view'],
  },
  { key: 'kitchen', name: 'Kitchen', permissions: ['orders:view', 'orders:update', 'menu:view', 'menu:stock'] },
];

export default PRESET_ROLES;
