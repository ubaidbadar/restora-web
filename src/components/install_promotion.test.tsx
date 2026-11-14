// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useToastStore from '../store/toast_store';
import ToastContainer from '../ui/toast_container';
import InstallPromotion from './install_promotion';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

function dispatchInstallPrompt(prompt: () => Promise<void>, outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as InstallPromptEvent;
  Object.defineProperties(event, {
    prompt: { value: prompt },
    userChoice: { value: Promise.resolve({ outcome }) },
  });
  act(() => window.dispatchEvent(event));
  return event;
}

function renderPromotion(active = true) {
  return render(
    <>
      <ToastContainer />
      <InstallPromotion active={active} />
    </>,
  );
}

afterEach(() => {
  cleanup();
  useToastStore.getState().toasts.forEach(({ id }) => useToastStore.getState().dismiss(id));
  vi.unstubAllGlobals();
});

describe('InstallPromotion', () => {
  it('waits for the app to finish loading, then shows the shared install toast', () => {
    const { rerender } = renderPromotion(false);
    const prompt = vi.fn(async () => {});
    const event = dispatchInstallPrompt(prompt);

    expect(event.defaultPrevented).toBe(true);
    expect(screen.queryByText('Install Restora for quick access.')).toBeNull();
    expect(useToastStore.getState().toasts).toHaveLength(0);

    rerender(
      <>
        <ToastContainer />
        <InstallPromotion active />
      </>,
    );

    expect(screen.getByText('Install Restora for quick access.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Install' })).toBeTruthy();
    expect(screen.queryByText('Open Restora in its own app window.')).toBeNull();
  });

  it('opens the native browser prompt when the toast action is pressed', async () => {
    const prompt = vi.fn(async () => {});
    renderPromotion();
    dispatchInstallPrompt(prompt);

    fireEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(prompt).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Install Restora for quick access.')).toBeNull());
  });

  it('does not show the same install invitation again after the toast is dismissed', () => {
    const { rerender } = renderPromotion();
    dispatchInstallPrompt(vi.fn(async () => {}));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Install Restora for quick access.')).toBeNull();

    rerender(
      <>
        <ToastContainer />
        <InstallPromotion active={false} />
      </>,
    );
    rerender(
      <>
        <ToastContainer />
        <InstallPromotion active />
      </>,
    );

    expect(screen.queryByText('Install Restora for quick access.')).toBeNull();
  });

  it('shows a toast if the browser cannot open its install prompt', async () => {
    const prompt = vi.fn(async () => {
      throw new Error('Install prompt unavailable');
    });
    renderPromotion();
    dispatchInstallPrompt(prompt);

    fireEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(await screen.findByText('Could not open the install prompt. Try again from your browser menu.')).toBeTruthy();
  });
});
