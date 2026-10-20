import type { SVGProps } from 'react';
import RestoraSymbol from './restora_symbol';

/** The app icon: the symbol on the primary tile. Colors come from the theme tokens. Same as brand/src/icon.svg. */
export default function RestoraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <RestoraSymbol x="6" y="6" width="28" height="28" className="fill-on-primary" />
    </svg>
  );
}
