import type OrdersWorkspaceState from '../types/orders_workspace_state';
import createStore from './create_store';

const KEY = 'restora-orders-workspace-v1';
const DEFAULTS = { sidebarHidden: false, detailsPanel: false, density: 'comfortable', menuDensity: 'comfortable' } as const;

function readPreferences() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return DEFAULTS;
    return {
      sidebarHidden: typeof saved.sidebarHidden === 'boolean' ? saved.sidebarHidden : false,
      detailsPanel: typeof saved.detailsPanel === 'boolean' ? saved.detailsPanel : false,
      density: saved.density === 'compact' ? 'compact' as const : 'comfortable' as const,
      menuDensity: saved.menuDensity === 'compact' ? 'compact' as const : 'comfortable' as const,
    };
  } catch {
    return DEFAULTS;
  }
}

const useOrdersWorkspaceStore = createStore<OrdersWorkspaceState>((set, get) => ({
  ...readPreferences(),
  setPreferences: (patch) => {
    const preferences = {
      sidebarHidden: patch.sidebarHidden ?? get().sidebarHidden,
      detailsPanel: patch.detailsPanel ?? get().detailsPanel,
      density: patch.density ?? get().density,
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

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY || event.key === null) useOrdersWorkspaceStore.setState(readPreferences());
  });
}

export default useOrdersWorkspaceStore;
