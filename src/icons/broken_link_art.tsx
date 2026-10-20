import type { SVGProps } from 'react';

/** Two chain links pulled apart: a link that does not work. Decorative only; colors are theme tokens. */
export default function BrokenLinkArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" {...props}>
      <ellipse cx="80" cy="110" rx="54" ry="6" className="fill-art-sand" />
      <circle cx="80" cy="58" r="46" className="fill-sunken" />
      <rect x="26" y="56" width="52" height="24" rx="12" transform="rotate(-35 52 68)" fill="none" strokeWidth="7" className="stroke-primary" />
      <rect x="82" y="36" width="52" height="24" rx="12" transform="rotate(-35 108 48)" fill="none" strokeWidth="7" className="stroke-primary opacity-60" />
      {/* The snap */}
      <path d="M76 40 72 32M86 70l4 8M90 50l9-3M68 60l-8 3" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-art-saffron" />
    </svg>
  );
}
