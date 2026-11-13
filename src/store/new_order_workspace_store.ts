import type NewOrderWorkspaceState from '../types/new_order_workspace_state';
import createStore from './create_store';

const KEY = 'restora-new-order-workspace-v2';
const DEFAULTS: Pick<NewOrderWorkspaceState, 'sidebarHidden' | 'orderPanel' | 'menuColumns'> = {
  sidebarHidden: false,
  orderPanel: 'split',
  menuColumns: 'auto',
};

function readPreferences() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return DEFAULTS;
    return {
      sidebarHidden: typeof saved.sidebarHidden === 'boolean' ? saved.sidebarHidden : DEFAULTS.sidebarHidden,
      orderPanel: saved.orderPanel === 'split' || saved.orderPanel === 'column' || saved.orderPanel === 'drawer'
        ? saved.orderPanel as NewOrderWorkspaceState['orderPanel']
        : DEFAULTS.orderPanel,
      menuColumns: saved.menuColumns === 'auto' || saved.menuColumns === 'list' || saved.menuColumns === '2' || saved.menuColumns === '3' || saved.menuColumns === '4'
        ? saved.menuColumns as NewOrderWorkspaceState['menuColumns']
        : DEFAULTS.menuColumns,
    };
  } catch {
    return DEFAULTS;
  }
}

const useNewOrderWorkspaceStore = createStore<NewOrderWorkspaceState>((set, get) => ({
  ...readPreferences(),
  setPreferences: (patch) => {
    const preferences = {
      sidebarHidden: patch.sidebarHidden ?? get().sidebarHidden,
      orderPanel: patch.orderPanel ?? get().orderPanel,
      menuColumns: patch.menuColumns ?? get().menuColumns,
    };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(preferences));
    } catch {
      // Layout changes still work in this tab if storage is unavailable.
    }
    set(preferences);
  },
  reset: () => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // Reset still works when storage is unavailable.
    }
    set(DEFAULTS);
  },
}));

export default useNewOrderWorkspaceStore;
