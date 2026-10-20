/** A grey placeholder in the shape of something still loading. Its size and shape come from `className`. */
export default function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-small bg-border/70 motion-safe:animate-pulse ${className}`} />;
}
