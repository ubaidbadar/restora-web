import { useEffect, useState } from 'react';
import toast from '../utils/toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

interface InstallPromotionProps {
  active: boolean;
}

/** Offers the browser's native PWA install prompt through Restora's shared toast UI. */
export default function InstallPromotion({ active }: InstallPromotionProps) {
  const [state, setState] = useState({
    prompt: null as BeforeInstallPromptEvent | null,
    installed: window.matchMedia?.('(display-mode: standalone)').matches === true || (navigator as Navigator & { standalone?: boolean }).standalone === true,
    shown: false,
  });

  useEffect(() => {
    const media = window.matchMedia?.('(display-mode: standalone)');
    const isStandalone = () => media?.matches === true || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      if (isStandalone()) return;
      setState((current) => ({ ...current, prompt: event as BeforeInstallPromptEvent, installed: false, shown: false }));
    };
    const installed = () => setState((current) => ({ ...current, prompt: null, installed: true }));
    const displayModeChanged = () => setState((current) => ({ ...current, installed: isStandalone() }));

    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    media?.addEventListener('change', displayModeChanged);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', installed);
      media?.removeEventListener('change', displayModeChanged);
    };
  }, []);

  useEffect(() => {
    if (!active || !state.prompt || state.installed || state.shown) return;

    const deferred = state.prompt;
    const install = async () => {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        setState((current) => ({ ...current, prompt: null, installed: current.installed || choice.outcome === 'accepted' }));
      } catch {
        setState((current) => ({ ...current, prompt: null }));
        toast.error('Could not open the install prompt. Try again from your browser menu.');
      }
    };

    toast.info('Install Restora for quick access.', {
      label: 'Install',
      onClick: () => void install(),
    });
    setState((current) => ({ ...current, shown: true }));
  }, [active, state.prompt, state.installed, state.shown]);

  return null;
}
