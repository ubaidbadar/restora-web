// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import useOrderAlertStore from '../store/order_alert_store';
import useWhatsAppInboxStatus from './useWhatsAppInboxStatus';

describe('useWhatsAppInboxStatus', () => {
  afterEach(cleanup);
  beforeEach(() => useOrderAlertStore.setState({
    fresh: [], muted: false,
    whatsappInbox: { status: 'checking', lastSyncedAt: null, unreadCount: 0 },
  }));

  it('subscribes to the latest global inbox sync state', () => {
    const { result } = renderHook(() => useWhatsAppInboxStatus());
    act(() => useOrderAlertStore.getState().setWhatsAppInbox({
      status: 'live', lastSyncedAt: 1_800_000_000_000, unreadCount: 4,
    }));
    expect(result.current).toEqual({
      status: 'live', lastSyncedAt: 1_800_000_000_000, unreadCount: 4,
    });
  });
});
