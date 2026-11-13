export default interface OrdersWorkspaceState {
  sidebarHidden: boolean;
  detailsPanel: boolean;
  density: 'comfortable' | 'compact';
  setPreferences: (patch: Partial<Pick<OrdersWorkspaceState, 'sidebarHidden' | 'detailsPanel' | 'density'>>) => void;
  reset: () => void;
}
