/**
 * What shows while something loads: the Restora cloche lifting its lid and settling, the same motion as the boot screen
 * in index.html (brand/README.md). It fades in late, so a quick load never flashes it, and stays still with reduced motion.
 */
export default function BrandLoader() {
  return (
    <div role="status" aria-label="Loading" className="grid place-items-center py-12 motion-safe:animate-fade-in-late">
      <svg viewBox="6 6 28 28" className="size-10 fill-primary" aria-hidden="true">
        <g className="origin-bottom-right [transform-box:fill-box] motion-safe:animate-lid">
          <circle cx="20" cy="9.5" r="2.5" />
          <path d="M9 23a11 11 0 0 1 22 0z" />
        </g>
        <rect x="7" y="25" width="26" height="4" rx="2" />
        <path d="M10.5 28h5L10 32.5z" />
      </svg>
    </div>
  );
}
