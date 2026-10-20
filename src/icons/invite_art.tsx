import type { SVGProps } from 'react';

const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}z`;

/** An invitation card with the Restora cloche rising out of its envelope, and a "join" badge. Decorative only. */
export default function InviteArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" {...props}>
      <ellipse cx="80" cy="110" rx="54" ry="6" className="fill-art-sand" />
      <circle cx="80" cy="58" r="46" className="fill-primary-soft" />
      <path d={sparkle(24, 34, 7)} className="fill-art-saffron" />
      <path d={sparkle(140, 18, 5)} className="fill-art-chili opacity-70" />
      <path d={sparkle(144, 96, 5)} className="fill-primary opacity-60" />
      <circle cx="18" cy="86" r="3" className="fill-art-leaf opacity-70" />

      <rect x="34" y="44" width="92" height="60" rx="8" className="fill-sunken stroke-primary/30" strokeWidth="1.5" />
      <rect x="46" y="18" width="68" height="60" rx="6" className="fill-surface stroke-primary/30" strokeWidth="1.5" />
      {/* The cloche on its plate */}
      <circle cx="80" cy="31" r="2.6" className="fill-primary" />
      <path d="M64 50a16 16 0 0 1 32 0z" className="fill-primary" />
      <path d="M70 44a10 10 0 0 1 6-6" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-surface opacity-50" />
      <rect x="58" y="50" width="44" height="4" rx="2" className="fill-art-saffron" />
      <path d="M34 60 80 86l46-26v36a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8z" className="fill-surface stroke-primary/30" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M36 101 68 79M124 101 92 79" className="stroke-primary/30" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="122" cy="38" r="13" className="fill-art-saffron" />
      <path d="M122 32v12M116 38h12" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-surface" />
    </svg>
  );
}
