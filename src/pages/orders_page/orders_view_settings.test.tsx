// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import OrdersViewSettings from './orders_view_settings';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';

describe('Orders view options', () => {
  afterEach(() => {
    cleanup();
    useOrdersWorkspaceStore.getState().reset();
  });

  it('applies layout choices directly from a compact menu instead of opening another modal', () => {
    render(<OrdersViewSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'View options' }));

    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('menuitem', { name: /Hide navigation sidebar/ }));
    expect(useOrdersWorkspaceStore.getState().sidebarHidden).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'View options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Show separate order details/ }));
    expect(useOrdersWorkspaceStore.getState().detailsPanel).toBe(true);
  });
});
