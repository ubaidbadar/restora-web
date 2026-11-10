// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsAppTab from './whatsapp_tab';
import api from '../../../config/api';
import navigate from '../../../utils/navigate';

vi.mock('../../../config/api', () => ({ default: { post: vi.fn() } }));
vi.mock('../../../hooks/useWorkplace', () => ({ default: () => ({ branch: { _id: 'branch-1' } }) }));
vi.mock('../../../hooks/useGet', () => ({ default: (url: string) => ({
  data: url.endsWith('/signup/config')
    ? { enabled: true, appId: '111222333444', configId: '999888777666' }
    : [],
  loading: false,
  error: undefined,
  get: vi.fn(),
  update: vi.fn(),
}) }));
vi.mock('../../../utils/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('../../../utils/navigate', () => ({ default: vi.fn() }));

const STATE_KEY = 'restora:whatsapp-signup-state';

describe('Meta WhatsApp Embedded Signup redirect flow', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/settings/whatsapp');
    window.sessionStorage.clear();
    vi.mocked(api.post).mockResolvedValue({ data: {
      id: 'connection-1', phoneNumberId: '1234567890123',
      phoneNumberDisplay: '+92 300 1234567', status: 'connected',
    } } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/settings/whatsapp');
  });

  it('navigates to Meta dialog oauth with the app config and a stored state', async () => {
    render(<WhatsAppTab />);
    const button = await screen.findByRole('button', { name: 'Connect WhatsApp Business' });
    fireEvent.click(button);
    expect(navigate).toHaveBeenCalledTimes(1);
    const firstCall = vi.mocked(navigate).mock.calls[0];
    expect(firstCall).toBeDefined();
    const url = new URL(firstCall![0]);
    expect(url.origin + url.pathname).toBe('https://www.facebook.com/v26.0/dialog/oauth');
    expect(url.searchParams.get('client_id')).toBe('111222333444');
    expect(url.searchParams.get('redirect_uri')).toBe('https://app.restora.live/settings/whatsapp');
    expect(url.searchParams.get('config_id')).toBe('999888777666');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('override_default_response_type')).toBe('true');
    const state = url.searchParams.get('state');
    expect(state).toBeTruthy();
    expect(window.sessionStorage.getItem(STATE_KEY)).toBe(state);
  });

  it('consumes the returned code once the state matches and strips it from the URL', async () => {
    window.history.pushState({}, '', '/settings/whatsapp?code=test-meta-code&state=test-state');
    window.sessionStorage.setItem(STATE_KEY, 'test-state');
    render(<WhatsAppTab />);
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/whatsapp/signup/complete', {
      code: 'test-meta-code',
      wabaId: '1506044834668577',
      phoneNumberId: '1441060799087277',
    }));
    expect(window.location.search).toBe('');
    await waitFor(() => expect(screen.getByText('WhatsApp connected successfully.')).toBeTruthy());
  });

  it('rejects a returned code whose state does not match', async () => {
    window.history.pushState({}, '', '/settings/whatsapp?code=test-meta-code&state=wrong-state');
    window.sessionStorage.setItem(STATE_KEY, 'test-state');
    render(<WhatsAppTab />);
    expect(screen.getByText('Meta signup could not be verified. Please try again.')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(window.location.search).toBe('');
  });

  it('reports a cancelled Meta signup instead of posting anything', async () => {
    window.history.pushState({}, '',
      '/settings/whatsapp?error=access_denied&error_reason=user_denied&error_description=Permissions+error');
    render(<WhatsAppTab />);
    expect(screen.getByText('Permissions error')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(window.location.search).toBe('');
  });

  it('does nothing on a plain visit without a returned code', async () => {
    render(<WhatsAppTab />);
    await screen.findByRole('button', { name: 'Connect WhatsApp Business' });
    expect(api.post).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
