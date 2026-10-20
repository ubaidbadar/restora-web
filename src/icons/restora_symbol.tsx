import type { SVGProps } from 'react';

/**
 * The Restora symbol: a cloche whose base ends in a speech-bubble tail. Takes the text color (fill-current).
 * Drawn on the app icon's 40×40 grid and shown through its own 28×28 box, so nested at x/y 6, size 28, it lines up.
 * Same shapes as brand/src/symbol.svg; change both together.
 */
export default function RestoraSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="6 6 28 28" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="20" cy="9.5" r="2.5" />
      <path d="M9 23a11 11 0 0 1 22 0z" />
      <rect x="7" y="25" width="26" height="4" rx="2" />
      <path d="M10.5 28h5L10 32.5z" />
    </svg>
  );
}
