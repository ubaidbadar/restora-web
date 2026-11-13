// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useNewOrderWorkspaceStore from './new_order_workspace_store';

const KEY = 'restora-new-order-workspace-v1';
const DEFAULTS = { sidebarHidden: false, orderPanel: 'column', menuDensity: 'comfortable' };

describe('new order workspace store', () => {
  beforeEach(() => {
    useNewOrderWorkspaceStore.getState().reset();
  });

  afterEach(() => vi.restoreAllMocks());

  it('keeps layout choices independent and saves them in this browser', () => {
    useNewOrderWorkspaceStore.getState().setPreferences({ sidebarHidden: true, orderPanel: 'drawer' });
    useNewOrderWorkspaceStore.getState().setPreferences({ menuDensity: 'compact' });

    expect(useNewOrderWorkspaceStore.getState()).toMatchObject({
      sidebarHidden: true,
      orderPanel: 'drawer',
      menuDensity: 'compact',
    });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({
      sidebarHidden: true,
      orderPanel: 'drawer',
      menuDensity: 'compact',
    });
  });

  it('restores the default layout and removes the saved value', () => {
    useNewOrderWorkspaceStore.getState().setPreferences({ sidebarHidden: true, orderPanel: 'drawer', menuDensity: 'compact' });
    useNewOrderWorkspaceStore.getState().reset();

    expect(useNewOrderWorkspaceStore.getState()).toMatchObject(DEFAULTS);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('keeps working in memory when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    });

    useNewOrderWorkspaceStore.getState().setPreferences({ sidebarHidden: true });

    expect(useNewOrderWorkspaceStore.getState().sidebarHidden).toBe(true);
  });
});
