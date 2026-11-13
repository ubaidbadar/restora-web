import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Button from '../ui/button';
import IconButton from '../ui/icon_button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

interface InstallPromotionProps {
  active: boolean;
}

/** Captures Chromium's native install event and exposes it through a clear, one-click install invitation. */
export default function InstallPromotion({ active }: InstallPromotionProps) {
  const [state, setState] = useState({
    prompt: null as BeforeInstallPromptEvent | null,
    installed: window.matchMedia?.('(display-mode: standalone)').matches === true || (navigator as Navigator & { standalone?: boolean }).standalone === true,
    dismissed: false,
  });

  useEffect(() => {
    const media = window.matchMedia?.('(display-mode: standalone)');
    const isStandalone = () => media?.matches === true || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      if (isStandalone()) return;
      setState((current) => ({ ...current, prompt: event as BeforeInstallPromptEvent, dismissed: false }));
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

  const install = async () => {
    const deferred = state.prompt;
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setState((current) => ({ ...current, prompt: null, dismissed: choice.outcome === 'dismissed' }));
    } catch {
      setState((current) => ({ ...current, prompt: null }));
    }
  };

  if (!active || !state.prompt || state.installed || state.dismissed) return null;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-card bg-surface p-4 shadow-lg ring-1 ring-border">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
        <Download size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">Install Restora</p>
        <p className="mt-0.5 text-sm text-muted">Open Restora like a desktop app, without keeping a browser tab open.</p>
      </div>
      <Button size="sm" onClick={() => void install()}>Install</Button>
      <IconButton icon={X} size="sm" aria-label="Not now" onClick={() => setState((current) => ({ ...current, dismissed: true }))} />
    </div>
  );
}
