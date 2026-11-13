import type NewOrderWorkspaceState from '../types/new_order_workspace_state';
import createStore from './create_store';

const KEY = 'restora-new-order-workspace-v1';
type Preferences = Pick<NewOrderWorkspaceState, 'sidebarHidden' | 'orderPanel' | 'menuDensity'>;
const DEFAULTS: Preferences = { sidebarHidden: false, orderPanel: 'column', menuDensity: 'comfortable' };

function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return DEFAULTS;
    return {
      sidebarHidden: typeof saved.sidebarHidden === 'boolean' ? saved.sidebarHidden : false,
      orderPanel: saved.orderPanel === 'drawer' ? 'drawer' : 'column',
      menuDensity: saved.menuDensity === 'balanced' || saved.menuDensity === 'compact' ? saved.menuDensity : 'comfortable',
    };
  } catch {
    return DEFAULTS;
  }
}

const useNewOrderWorkspaceStore = createStore<NewOrderWorkspaceState>((set, get) => ({
  ...readPreferences(),
  setPreferences: (patch) => {
    const preferences: Preferences = {
      sidebarHidden: patch.sidebarHidden ?? get().sidebarHidden,
      orderPanel: patch.orderPanel ?? get().orderPanel,
      menuDensity: patch.menuDensity ?? get().menuDensity,
    };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(preferences));
    } catch {
      // The current tab still works when browser storage is unavailable.
    }
    set(preferences);
  },
  reset: () => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // The current tab still resets when browser storage is unavailable.
    }
    set(DEFAULTS);
  },
}));

export default useNewOrderWorkspaceStore;
