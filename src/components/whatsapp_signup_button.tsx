import { useEffect, useState } from 'react';
import api from '../config/api';
import SkeletonList from './skeleton_list';
import Button from '../ui/button';
import toast from '../utils/toast';
import getAxiosMessage from '../utils/get_axios_message';
import parseWhatsAppSignupMessage from '../utils/parse_whatsapp_signup_message';

type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending' };

// Meta returns the selected WABA/phone IDs through WA_EMBEDDED_SIGNUP and the one-time code through FB.login.
const META_DIALOG_VERSION = 'v26.0';

type MetaLoginResponse = { authResponse?: { code?: string } | null };
type MetaSdk = {
  init: (options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }) => void;
  login: (
    callback: (response: MetaLoginResponse) => void,
    options: {
      config_id: string;
      auth_type: 'rerequest';
      response_type: 'code';
      override_default_response_type: true;
      extras: { setup: Record<string, never> };
    },
  ) => void;
};
declare global {
  interface Window {
    FB?: MetaSdk;
    fbAsyncInit?: () => void;
  }
}

let metaSdkPromise: Promise<MetaSdk> | undefined;
let metaSdkAppId: string | undefined;
function loadMetaSdk(appId: string): Promise<MetaSdk> {
  const initialize = (sdk: MetaSdk) => {
    if (metaSdkAppId !== appId) {
      sdk.init({ appId, autoLogAppEvents: true, xfbml: false, version: META_DIALOG_VERSION });
      metaSdkAppId = appId;
    }
    return sdk;
  };
  if (window.FB) return Promise.resolve(initialize(window.FB));
  const pending = (metaSdkPromise ??= new Promise<MetaSdk>((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (window.FB) resolve(window.FB);
      else reject(new Error('Meta sign-in did not initialize.'));
    };
    const script = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    if (script) {
      script.addEventListener('load', () => {
        if (window.FB) resolve(window.FB);
        else reject(new Error('Meta sign-in did not initialize.'));
      }, { once: true });
      script.addEventListener('error', () => reject(new Error('Meta sign-in could not be loaded.')), { once: true });
      return;
    }
    const added = document.createElement('script');
    added.id = 'facebook-jssdk';
    added.src = 'https://connect.facebook.net/en_US/sdk.js';
    added.async = true;
    added.defer = true;
    added.crossOrigin = 'anonymous';
    added.onerror = () => reject(new Error('Meta sign-in could not be loaded.'));
    document.head.appendChild(added);
  }).catch((error: unknown) => {
    metaSdkPromise = undefined;
    document.getElementById('facebook-jssdk')?.remove();
    throw error;
  }));
  return pending.then(initialize);
}

type SignupUiState = {
  ready: boolean;
  busy: boolean;
  message: string;
  signupBranchId?: string;
  code?: string;
  wabaId?: string;
  phoneNumberId?: string;
  submitting?: boolean;
  failed?: boolean;
  attempt?: number;
};

export default function WhatsAppSignupButton({ appId, configId, branchId, hasConnection, onConnected }: {
  appId: string; configId: string; branchId: string; hasConnection: boolean; onConnected: (result: SignupResult) => void;
}) {
  const [status, setStatus] = useState<SignupUiState>({ ready: false, busy: false, message: 'Loading Meta sign-in…' });

  useEffect(() => {
    let active = true;
    loadMetaSdk(appId).then(() => {
      if (active) setStatus(current => ({ ...current, ready: true, failed: false, message: '' }));
    }).catch(() => {
      if (active) setStatus({ ready: false, busy: false, failed: true,
        message: 'Meta sign-in could not be loaded. Check your connection and allow connect.facebook.net.' });
    });
    return () => { active = false; };
  }, [appId]);

  useEffect(() => {
    const onMetaMessage = (event: MessageEvent) => {
      if (!status.busy || status.signupBranchId !== branchId) return;
      const result = parseWhatsAppSignupMessage(event.origin, event.data);
      if (!result) return;
      if (result.event === 'finish') {
        setStatus(current => current.signupBranchId === branchId && current.busy ? {
          ...current, wabaId: result.wabaId, phoneNumberId: result.phoneNumberId,
          message: 'Meta selected your WhatsApp number. Finishing the secure connection…',
        } : current);
      } else {
        setStatus({ ready: true, busy: false, failed: true,
          message: result.event === 'cancel' ? 'Meta signup was cancelled. You can try again.' :
            result.event === 'invalid' ? 'Meta did not return a valid WhatsApp account and phone number.' :
              'Meta reported a signup error. Please try again or contact support.',
        });
      }
    };
    window.addEventListener('message', onMetaMessage);
    return () => window.removeEventListener('message', onMetaMessage);
  }, [status.busy, status.signupBranchId, branchId]);

  useEffect(() => {
    if (!status.busy || status.submitting) return;
    const timer = window.setTimeout(() => {
      setStatus(current => current.busy && !current.submitting
        ? { ready: true, busy: false, failed: true,
          message: 'Meta did not finish connecting your number. No number was connected. Please try again.' }
        : current);
    }, 60_000);
    return () => window.clearTimeout(timer);
  }, [status.busy, status.submitting, status.attempt]);

  useEffect(() => {
    if (status.busy && status.signupBranchId && status.signupBranchId !== branchId) {
      setStatus({ ready: true, busy: false, failed: true,
        message: 'The selected branch changed during Meta authorization. Please start again from the intended branch.' });
      return;
    }
    if (!status.code || !status.wabaId || !status.phoneNumberId || status.submitting || !status.busy) return;
    setStatus(current => ({ ...current, submitting: true, message: 'Verifying and saving your restaurant number…' }));
    api.post<SignupResult>('/whatsapp/signup/complete', {
      code: status.code, wabaId: status.wabaId, phoneNumberId: status.phoneNumberId,
    }).then(({ data }) => {
      onConnected(data);
      setStatus({ ready: true, busy: false,
        message: data.status === 'connected' ? 'WhatsApp connected successfully.' : 'Meta authorized the number. Register it with a PIN below.' });
      toast.success('WhatsApp authorization saved');
    }).catch(err => {
      setStatus({ ready: true, busy: false, failed: true, message: getAxiosMessage(err) });
      toast.error(getAxiosMessage(err));
    });
  }, [status.busy, status.code, status.wabaId, status.phoneNumberId, status.submitting, status.signupBranchId, branchId, onConnected]);

  const connect = () => {
    if (!window.FB || !status.ready) return;
    const attempt = (status.attempt ?? 0) + 1;
    setStatus({ ready: true, busy: true, failed: false, message: 'Finish in the window that opened.',
      signupBranchId: branchId, attempt });
    try {
      window.FB.login((response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setStatus(current => current.attempt === attempt && current.busy
            ? { ready: true, busy: false, failed: true, message: 'Meta did not return an authorization code. Please try again.' }
            : current);
          return;
        }
        setStatus(current => current.attempt === attempt && current.busy
          ? { ...current, code, message: 'Waiting for Meta to confirm your WhatsApp number…' }
          : current);
      }, {
        config_id: configId,
        auth_type: 'rerequest',
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {} },
      });
    } catch {
      setStatus({ ready: true, busy: false, failed: true, message: 'Meta could not open the signup window. Please try again.' });
    }
  };

  if (status.failed) return (
    <div className="@container flex flex-col items-start gap-4">
      <div role="alert" className="w-full rounded-control border border-danger-200 bg-danger-50 p-4 text-danger-800">
        <p className="font-semibold">Couldn't connect your number</p>
        <p className="mt-2 text-sm">{status.message}</p>
      </div>
      <Button onClick={() => {
        if (status.ready) { connect(); return; }
        setStatus({ ready: false, busy: false, message: 'Loading Meta sign-in…' });
        loadMetaSdk(appId).then(() => setStatus({ ready: true, busy: false, message: '' }))
          .catch(() => setStatus({ ready: false, busy: false, failed: true,
            message: 'Meta sign-in could not be loaded. Check your connection and try again.' }));
      }>Try again</Button>
    </div>
  );

  return (
    <div className="@container flex flex-col items-start gap-4">
      {!status.busy && (
        <ol className="grid w-full gap-3 @lg:grid-cols-3" aria-label="WhatsApp connection steps">
          {[
            { title: 'Log in with Facebook', detail: 'A Meta window opens.' },
            { title: 'Pick your number', detail: "Choose your restaurant's WhatsApp number." },
            { title: 'Done', detail: 'Messages show up in WhatsApp inbox.' },
          ].map((step, index) => (
            <li key={step.title} className="rounded-card border border-border bg-canvas p-4">
              <span className="mb-3 flex size-8 items-center justify-center rounded-pill bg-primary-soft font-semibold text-accent-text">{index + 1}</span>
              <strong className="block text-ink">{step.title}</strong>
              <p className="mt-2 text-sm text-muted">{step.detail}</p>
            </li>
          ))}
        </ol>
      )}
      {status.busy ? (
        <>
          <div role="status" className="w-full rounded-control border border-info-200 bg-info-50 p-4">
            <p className="font-semibold text-ink">{status.submitting ? 'Finishing your connection…' : 'Waiting for Meta…'}</p>
            <p className="mt-1 text-sm text-body">{status.message}</p>
          </div>
          {!status.submitting && <p className="text-sm text-muted">
            Window didn't open? <Button variant="primaryLink" onClick={connect}>Try again</Button>
          </p>}
        </>
      ) : (
        <>
          {status.ready ? <Button onClick={connect}>{hasConnection ? 'Connect another number' : 'Connect WhatsApp'}</Button>
            : <SkeletonList rows={1} variant="lines" />}
          <p className="text-sm text-muted">
            Your Facebook password is never shared with Restora. Use a number that can receive a verification code.
          </p>
        </>
      )}
    </div>
  );
}

