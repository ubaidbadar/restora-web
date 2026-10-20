import type { SVGProps } from 'react';

// A four-point sparkle centred on (x, y).
const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}z`;

const TICKET_ROWS = [114, 136, 158, 180];

/**
 * The drawing beside the sign-in forms: the Restora cloche lifting its lid over a plate of biryani, a cup of chai,
 * an order ticket and a WhatsApp chat. Decorative only. Colors are theme tokens (the art-* group in index.css).
 */
export default function AuthArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 520 460" aria-hidden="true" {...props}>
      {/* Accents */}
      <circle cx="468" cy="58" r="11" className="fill-art-rice" />
      <circle cx="30" cy="196" r="6" className="fill-art-saffron opacity-50" />
      <path d={sparkle(196, 74, 11)} className="fill-art-saffron" />
      <path d={sparkle(338, 52, 7)} className="fill-primary opacity-60" />
      <path d={sparkle(470, 392, 9)} className="fill-art-saffron" />
      <path d={sparkle(30, 300, 6)} className="fill-art-chili opacity-70" />

      {/* Table */}
      <ellipse cx="258" cy="378" rx="214" ry="18" className="fill-art-sand" />

      {/* Order ticket */}
      <g transform="rotate(-8 102 145)">
        <rect x="45" y="77" width="124" height="150" rx="12" className="fill-ink opacity-5" />
        <rect x="40" y="70" width="124" height="150" rx="12" className="fill-surface stroke-border" strokeWidth="1.5" />
        <path d="M40 100V82a12 12 0 0 1 12-12h100a12 12 0 0 1 12 12v18z" className="fill-primary-soft" />
        <rect x="54" y="81" width="54" height="9" rx="4.5" className="fill-primary opacity-50" />
        <circle cx="148" cy="85" r="9" className="fill-art-leaf" />
        <path d="m144 85 3 3 5-6" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-surface" />
        {TICKET_ROWS.map((y) => (
          <g key={y}>
            <circle cx="58" cy={y + 4} r="4" className="fill-art-saffron" />
            <rect x="68" y={y} width="58" height="8" rx="4" className="fill-sunken" />
            <rect x="134" y={y} width="18" height="8" rx="4" className="fill-border" />
          </g>
        ))}
        <rect x="54" y="202" width="98" height="2" className="fill-border" />
      </g>

      {/* Chai */}
      <ellipse cx="99" cy="346" rx="36" ry="7" className="fill-art-sand" />
      <path d="M76 288h46l-6 56H82z" className="fill-art-saffron" />
      <rect x="75" y="284" width="48" height="10" rx="3" className="fill-art-rice" />
      <path d="M92 276c-6-8 6-12 0-22M108 274c-6-8 6-12 0-22" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-border-strong opacity-40" />

      {/* Phone with a WhatsApp chat */}
      <g transform="rotate(7 431 215)">
        <rect x="372" y="108" width="118" height="214" rx="20" className="fill-ink" />
        <rect x="380" y="122" width="102" height="186" rx="13" className="fill-surface" />
        <circle cx="394" cy="137" r="7" className="fill-art-leaf" />
        <rect x="406" y="133" width="44" height="8" rx="4" className="fill-sunken" />
        <rect x="388" y="156" width="62" height="20" rx="8" className="fill-sunken" />
        <rect x="410" y="184" width="64" height="30" rx="8" className="fill-art-chat" />
        <rect x="388" y="222" width="52" height="20" rx="8" className="fill-sunken" />
        <rect x="404" y="250" width="70" height="20" rx="8" className="fill-art-chat" />
        <rect x="388" y="280" width="40" height="18" rx="9" className="fill-sunken" />
        <circle cx="400" cy="289" r="2.2" className="fill-muted" />
        <circle cx="408" cy="289" r="2.2" className="fill-muted" />
        <circle cx="416" cy="289" r="2.2" className="fill-muted" />
      </g>
      <circle cx="486" cy="112" r="20" className="fill-art-chili" />
      <path d="M486 121.5l-8.6-8.7a5.6 5.6 0 0 1 8.6-7.1a5.6 5.6 0 0 1 8.6 7.1z" className="fill-surface" />

      {/* Cloche: base with its speech-bubble tail, the biryani, and the lid lifting */}
      <rect x="140" y="322" width="220" height="18" rx="9" className="fill-primary-hover" />
      <path d="M168 336h30l-46 28z" className="fill-primary-hover" />
      <ellipse cx="250" cy="322" rx="94" ry="9" className="fill-surface" />
      <path d="M176 321c12-50 136-50 148 0z" className="fill-art-rice" />
      <ellipse cx="206" cy="311" rx="10" ry="7.5" className="fill-surface" />
      <circle cx="206" cy="311" r="4" className="fill-art-saffron" />
      <circle cx="232" cy="296" r="5" className="fill-art-chili" />
      <circle cx="262" cy="290" r="4" className="fill-art-leaf" />
      <circle cx="248" cy="310" r="3.5" className="fill-art-leaf" />
      <circle cx="286" cy="304" r="5" className="fill-art-chili" />
      <path d="M302 318a12 12 0 0 1 16-11l-4 11z" className="fill-art-saffron" />
      <path d="M212 280c-8-11 8-17 0-30M240 272c-8-11 8-17 0-30" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-border-strong opacity-35" />
      <g transform="rotate(35 340 322)">
        <ellipse cx="250" cy="322" rx="90" ry="8" className="fill-primary-hover" />
        <path d="M160 322a90 90 0 0 1 180 0z" className="fill-primary" />
        <circle cx="250" cy="221" r="13" className="fill-primary" />
        <path d="M188 300a64 64 0 0 1 38-52" fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-surface opacity-30" />
      </g>
    </svg>
  );
}
