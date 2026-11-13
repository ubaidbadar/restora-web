type OrdersWorkspacePreferences = {
  sidebarHidden: boolean;
  detailsPanel: boolean;
  density: 'comfortable' | 'compact';
  menuDensity: 'comfortable' | 'compact';
};

export default interface OrdersWorkspaceState extends OrdersWorkspacePreferences {
  setPreferences: (patch: Partial<OrdersWorkspacePreferences>) => void;
  reset: () => void;
}
