/** Where to go after signing in: a path inside the app from `?next=`, never another site. */
export default function safeNext(next: string | null | undefined) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
