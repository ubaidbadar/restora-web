// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsAppTab from './whatsapp_tab';
import api from '../../../config/api';

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

type MetaResponse = { authResponse?: { code?: string } };
let loginCallback: ((response: MetaResponse) => void) | undefined;

async function launch() {
  render(<WhatsAppTab />);
  const button = await screen.findByRole('button', { name: 'Connect WhatsApp Business' });
  fireEvent.click(button);
  expect(loginCallback).toBeDefined();
}

describe('Meta WhatsApp Embedded Signup completion', () => {
  beforeEach(() => {
    loginCallback = undefined;
    Object.assign(window, { FB: {
      init: vi.fn(),
      login: vi.fn((cb: (response: MetaResponse) => void) => { loginCallback = cb; }),
    } });
    vi.mocked(api.post).mockResolvedValue({ data: {
      id: 'connection-1', phoneNumberId: '1234567890123',
      phoneNumberDisplay: '+92 300 1234567', status: 'connected',
    } } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    delete window.FB;
  });

  it('submits Meta code and selected WABA from the session message', async () => {
    await launch();
    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://www.facebook.com',
        data: JSON.stringify({ type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH',
          data: { waba_id: '1234567890123', phone_number_id: '9876543210123' } }),
      }));
      loginCallback!({ authResponse: { code: 'test-meta-code' } });
    });
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/whatsapp/signup/complete', {
      code: 'test-meta-code', wabaId: '1234567890123', phoneNumberId: '9876543210123',
    }));
  });

  it('submits the code alone if Meta omits the session event', async () => {
    await launch();
    act(() => loginCallback!({ authResponse: { code: 'test-meta-code' } }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/whatsapp/signup/complete', {
      code: 'test-meta-code',
    }), { timeout: 3000 });
    expect(screen.getByText('WhatsApp connected successfully.')).toBeTruthy();
  });

  it('reports a missing authorization code instead of silently doing nothing', async () => {
    await launch();
    act(() => loginCallback!({}));
    expect(screen.getByText('Meta did not return an authorization code. Finish the Meta signup and try again.')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects an ambiguous session with multiple WhatsApp accounts', async () => {
    await launch();
    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://www.facebook.com',
        data: JSON.stringify({ type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH',
          data: { waba_ids: ['1234567890123', '999888777666'] } }),
      }));
    });
    expect(screen.getByText('Meta returned multiple WhatsApp accounts. Select one account and retry.')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });
});
