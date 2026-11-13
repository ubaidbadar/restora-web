type NewOrderWorkspacePreferences = {
  sidebarHidden: boolean;
  orderPanel: 'column' | 'drawer';
  menuDensity: 'comfortable' | 'balanced' | 'compact';
};

export default interface NewOrderWorkspaceState extends NewOrderWorkspacePreferences {
  setPreferences: (patch: Partial<NewOrderWorkspacePreferences>) => void;
  reset: () => void;
}
