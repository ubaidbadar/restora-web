import type { SVGProps } from 'react';

const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}z`;

/** An envelope with a letter and a green tick: a link is on its way. Decorative only; colors are theme tokens. */
export default function MailArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" {...props}>
      <ellipse cx="80" cy="110" rx="54" ry="6" className="fill-art-sand" />
      <circle cx="80" cy="58" r="46" className="fill-primary-soft" />
      <path d={sparkle(26, 30, 6)} className="fill-art-saffron" />
      <path d={sparkle(142, 92, 5)} className="fill-primary opacity-60" />
      <circle cx="20" cy="82" r="3" className="fill-art-chili opacity-60" />

      {/* Envelope back, the letter, then the front */}
      <rect x="34" y="44" width="92" height="60" rx="8" className="fill-sunken stroke-primary/30" strokeWidth="1.5" />
      <rect x="46" y="22" width="68" height="56" rx="6" className="fill-surface stroke-primary/30" strokeWidth="1.5" />
      <rect x="56" y="33" width="34" height="6" rx="3" className="fill-primary opacity-60" />
      <rect x="56" y="45" width="48" height="5" rx="2.5" className="fill-sunken" />
      <rect x="56" y="55" width="38" height="5" rx="2.5" className="fill-sunken" />
      <path d="M34 60 80 86l46-26v36a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8z" className="fill-surface stroke-primary/30" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M36 101 68 79M124 101 92 79" className="stroke-primary/30" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="122" cy="40" r="13" className="fill-art-leaf" />
      <path d="m116 40 4 4 8-9" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="stroke-surface" />
    </svg>
  );
}
