export default interface NewOrderWorkspaceState {
  sidebarHidden: boolean;
  orderPanel: 'split' | 'column' | 'drawer';
  menuColumns: 'auto' | 'list' | '2' | '3' | '4';
  setPreferences: (patch: Partial<Pick<NewOrderWorkspaceState, 'sidebarHidden' | 'orderPanel' | 'menuColumns'>>) => void;
  reset: () => void;
}
