/** One signed-in session of your account (`GET /me/sessions`). */
export default interface WebSession {
  token: string;
  /** e.g. "Chrome on Android". */
  device: string;
  createdAt: string;
  updatedAt: string;
  current: boolean;
  restaurantName?: string;
}
