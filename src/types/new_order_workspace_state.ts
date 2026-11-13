export default interface NewOrderWorkspaceState {
  sidebarHidden: boolean;
  orderPanel: 'column' | 'drawer';
  menuDensity: 'comfortable' | 'balanced' | 'compact';
  setPreferences: (patch: Partial<Pick<NewOrderWorkspaceState, 'sidebarHidden' | 'orderPanel' | 'menuDensity'>>) => void;
  reset: () => void;
}
