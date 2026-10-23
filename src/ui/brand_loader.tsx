/**
 * What shows while a page loads: the Restora app icon (the white cloche on its primary tile, as the logo) with the lid
 * lifting and settling, the same as the boot screen in index.html (brand/README.md). It fades in late, so a quick load
 * never flashes it, and stays still with reduced motion.
 */
export default function BrandLoader() {
  return (
    <div role="status" aria-label="Loading" className="grid place-items-center motion-safe:animate-fade-in-late">
      <svg viewBox="0 0 40 40" className="size-18" aria-hidden="true">
        <rect width="40" height="40" rx="10" className="fill-primary" />
        <g className="fill-on-primary">
          <g className="origin-bottom-right [transform-box:fill-box] motion-safe:animate-lid">
            <circle cx="20" cy="9.5" r="2.5" />
            <path d="M9 23a11 11 0 0 1 22 0z" />
          </g>
          <rect x="7" y="25" width="26" height="4" rx="2" />
          <path d="M10.5 28h5L10 32.5z" />
        </g>
      </svg>
    </div>
  );
}
