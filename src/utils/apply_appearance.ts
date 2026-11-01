import type RestaurantSettings from '@shared/restaurant_settings';

type Appearance = NonNullable<RestaurantSettings['appearance']>;

/** Kept on the device, so the next start (and index.html, before the app loads) paints in the restaurant's colours. */
const KEY = 'restora-appearance';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function paint() {
  let appearance: Partial<Appearance> = {};
  try {
    appearance = JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    // Storage blocked or broken: the default look.
  }
  const root = document.documentElement;
  root.dataset.theme = appearance.theme ?? 'indigo';
  root.dataset.mode = appearance.mode === 'dark' || (appearance.mode === 'system' && prefersDark.matches) ? 'dark' : 'light';
  root.dataset.sidebar = appearance.sidebar ?? 'plain';
  // The browser's bar takes the page's colour.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.body).backgroundColor);
}

// "Follow device": the page changes with the phone or PC.
prefersDark.addEventListener('change', paint);

/**
 * Shows the app in the restaurant's appearance (Settings → Appearance): its theme, light or dark (or the device's own
 * setting) and the sidebar. Called whenever `/me` changes; with nothing (signed out) it keeps the last one.
 */
export default function applyAppearance(appearance?: Appearance) {
  if (appearance) {
    try {
      localStorage.setItem(KEY, JSON.stringify(appearance));
    } catch {
      // Not kept: this start still shows it.
    }
  }
  paint();
}
