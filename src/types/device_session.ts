/** An account signed in on this browser (Better Auth multi-session). */
export default interface DeviceSession {
  session: { token: string; userId: string };
  user: { id: string; name: string; email: string; image?: string | null };
}
