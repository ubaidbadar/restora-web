// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import useAuthStore from '../store/auth_store';
import sampleMe from '../test/sample_me';
import useNavLinks from './useNavLinks';

describe('WhatsApp navigation visibility', () => {
  afterEach(cleanup);

  it('hides the WhatsApp inbox link without removing other navigation links', () => {
    useAuthStore.getState().setMe(sampleMe());
    const { result } = renderHook(() => useNavLinks());
    const destinations = [...result.current.main, ...result.current.more].map(link => link.to);
    expect(destinations).not.toContain('/whatsapp');
    expect(destinations).toContain('/orders');
    expect(destinations).toContain('/settings');
  });
});
