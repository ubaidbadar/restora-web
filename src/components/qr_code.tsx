import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  /** Says what the code is, for screen readers. */
  label: string;
  className?: string;
}

/** A QR code drawn as one SVG path (crisp at any size, prints sharp). Black on white whatever the theme: scanners need it. */
export default function QrCode({ value, label, className = '' }: QrCodeProps) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' });
  const size = modules.size;
  let path = '';
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) if (modules.get(x, y)) path += `M${x + 2} ${y + 2}h1v1h-1z`;
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${size + 4} ${size + 4}`} shapeRendering="crispEdges" className={className}>
      <rect width="100%" height="100%" fill="white" />
      <path d={path} fill="black" />
    </svg>
  );
}
