import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import THEMES from './constants/themes';

/** Every theme in src/index.css stays readable, light and dark (WCAG AA, 4.5:1 for text and button labels). */
const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

/** A token's hex in a block of the stylesheet that starts with `selector`. */
const token = (selector: string, name: string) => {
  const block = css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
  return block.match(new RegExp(`--color-${name}: (#[0-9A-Fa-f]{6})`))?.[1];
};

const WHITE = '#FFFFFF';
const LIGHT_SURFACE = '#FFFFFF';
const DARK_SURFACE = '#151B28';
const DARK_CANVAS = '#0B0F19';

describe.each(THEMES.map((theme) => theme.value))('theme %s', (theme) => {
  const light = (name: string) => (theme === 'indigo' ? token('@theme {', name) : token(`[data-theme='${theme}'] {`, name)) ?? token('@theme {', name)!;
  const sidebar = token(`[data-theme='${theme}'] {`, 'sidebar')!;
  const sidebarAccent = token(`[data-theme='${theme}'] {`, 'sidebar-accent')!;
  const darkPrimary = theme === 'indigo' ? token(":root[data-mode='dark'] {", 'primary')! : token(`:root[data-theme='${theme}'][data-mode='dark']`, 'primary')!;
  const darkHover = theme === 'indigo' ? token(":root[data-mode='dark'] {", 'primary-hover')! : token(`:root[data-theme='${theme}'][data-mode='dark']`, 'primary-hover')!;

  it('light: white on its buttons, and its colour as text on the page', () => {
    expect(contrast(light('primary'), WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light('primary-hover'), WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light('primary'), LIGHT_SURFACE)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light('primary'), light('primary-soft'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light('accent-text'), light('canvas'))).toBeGreaterThanOrEqual(4.5);
  });

  it('dark: its deep colour on its buttons, and its colour as text on the page', () => {
    expect(contrast(darkPrimary, sidebar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(darkHover, sidebar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(darkPrimary, DARK_SURFACE)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(darkPrimary, DARK_CANVAS)).toBeGreaterThanOrEqual(4.5);
  });

  it('sidebar in the theme colour: white text and the accent on it, and the deep colour on accent buttons', () => {
    expect(contrast(WHITE, sidebar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(sidebarAccent, sidebar)).toBeGreaterThanOrEqual(4.5);
  });
});
