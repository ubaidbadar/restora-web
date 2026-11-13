// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useNewOrderWorkspaceStore from './new_order_workspace_store';

const KEY = 'restora-new-order-workspace-v2';
const DEFAULTS = { sidebarHidden: false, orderPanel: 'split', menuColumns: 'auto' };

describe('new order workspace store', () => {
  beforeEach(() => useNewOrderWorkspaceStore.getState().reset());
  afterEach(() => vi.restoreAllMocks());

  it('saves independent navigation, order panel and menu column preferences', () => {
    useNewOrderWorkspaceStore.getState().setPreferences({ sidebarHidden: true });
    useNewOrderWorkspaceStore.getState().setPreferences({ orderPanel: 'drawer' });
    useNewOrderWorkspaceStore.getState().setPreferences({ menuColumns: '4' });

    expect(useNewOrderWorkspaceStore.getState()).toMatchObject({
      sidebarHidden: true,
      orderPanel: 'drawer',
      menuColumns: '4',
    });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({
      sidebarHidden: true,
      orderPanel: 'drawer',
      menuColumns: '4',
    });
  });

  it('selects the split workspace without changing dish layout or navigation', () => {
    useNewOrderWorkspaceStore.getState().setPreferences({ sidebarHidden: true, menuColumns: '3', orderPanel: 'column' });
    useNewOrderWorkspaceStore.getState().setPreferences({ orderPanel: 'split' });
    expect(useNewOrderWorkspaceStore.getState()).toMatchObject({
      sidebarHidden: true,
      menuColumns: '3',
      orderPanel: 'split',
    });
  });

  it('resets every option to the new three-panel default', () => {
    useNewOrderWorkspaceStore.getState().setPreferences({ sidebarHidden: true, orderPanel: 'drawer', menuColumns: 'list' });
    useNewOrderWorkspaceStore.getState().reset();
    expect(useNewOrderWorkspaceStore.getState()).toMatchObject(DEFAULTS);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('keeps the current layout usable when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    });
    useNewOrderWorkspaceStore.getState().setPreferences({ menuColumns: '2' });
    expect(useNewOrderWorkspaceStore.getState().menuColumns).toBe('2');
  });
});
