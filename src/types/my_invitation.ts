/** An invitation sent to your email, listed on /restaurants. */
export default interface MyInvitation {
  _id: string;
  restaurantName: string;
  roleNames: string[];
  invitedByName?: string;
}
