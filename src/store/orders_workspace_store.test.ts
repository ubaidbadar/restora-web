// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useOrdersWorkspaceStore from './orders_workspace_store';

const KEY = 'restora-orders-workspace-v1';
const DEFAULTS = { sidebarHidden: false, detailsPanel: false, density: 'comfortable', menuDensity: 'comfortable' };

describe('orders workspace store', () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
    useOrdersWorkspaceStore.getState().reset();
  });

  afterEach(() => vi.restoreAllMocks());

  it('saves layout choices in this browser and keeps unrelated choices when one changes', () => {
    useOrdersWorkspaceStore.getState().setPreferences({ sidebarHidden: true, detailsPanel: true });
    useOrdersWorkspaceStore.getState().setPreferences({ density: 'compact', menuDensity: 'compact' });

    expect(useOrdersWorkspaceStore.getState()).toMatchObject({
      sidebarHidden: true,
      detailsPanel: true,
      density: 'compact',
      menuDensity: 'compact',
    });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({
      sidebarHidden: true,
      detailsPanel: true,
      density: 'compact',
      menuDensity: 'compact',
    });
  });

  it('restores the default layout and removes the saved value', () => {
    useOrdersWorkspaceStore.getState().setPreferences({ sidebarHidden: true, detailsPanel: true, density: 'compact', menuDensity: 'compact' });
    useOrdersWorkspaceStore.getState().reset();

    expect(useOrdersWorkspaceStore.getState()).toMatchObject(DEFAULTS);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('syncs changes made in another tab', () => {
    localStorage.setItem(KEY, JSON.stringify({ sidebarHidden: true, detailsPanel: true, density: 'compact', menuDensity: 'compact' }));
    window.dispatchEvent(new StorageEvent('storage', { key: KEY }));

    expect(useOrdersWorkspaceStore.getState()).toMatchObject({
      sidebarHidden: true,
      detailsPanel: true,
      density: 'compact',
      menuDensity: 'compact',
    });
  });

  it('keeps working in memory when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    });

    useOrdersWorkspaceStore.getState().setPreferences({ sidebarHidden: true });

    expect(useOrdersWorkspaceStore.getState().sidebarHidden).toBe(true);
  });

  it('uses safe defaults for invalid saved data', () => {
    localStorage.setItem(KEY, '{invalid');
    window.dispatchEvent(new StorageEvent('storage', { key: KEY }));

    expect(useOrdersWorkspaceStore.getState()).toMatchObject(DEFAULTS);
  });
});
