import { beforeEach, describe, expect, it } from 'vitest';
import useOrderAlertStore from './order_alert_store';

describe('WhatsApp inbox alert state', () => {
  beforeEach(() => useOrderAlertStore.setState({
    fresh: [], muted: false,
    whatsappInbox: { status: 'checking', lastSyncedAt: null, unreadCount: 0 },
  }));

  it('stores the latest successful sync and unread count without changing sound settings', () => {
    useOrderAlertStore.getState().setWhatsAppInbox({
      status: 'live', lastSyncedAt: 1_800_000_000_000, unreadCount: 3,
    });
    expect(useOrderAlertStore.getState().whatsappInbox).toEqual({
      status: 'live', lastSyncedAt: 1_800_000_000_000, unreadCount: 3,
    });
    expect(useOrderAlertStore.getState().muted).toBe(false);
  });

  it('keeps the last successful sync when the connection pauses or fails', () => {
    useOrderAlertStore.getState().setWhatsAppInbox({ status: 'live', lastSyncedAt: 123, unreadCount: 1 });
    useOrderAlertStore.getState().setWhatsAppInbox({ status: 'offline' });
    expect(useOrderAlertStore.getState().whatsappInbox).toEqual({
      status: 'offline', lastSyncedAt: 123, unreadCount: 1,
    });
  });
});
