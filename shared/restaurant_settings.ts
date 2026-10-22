/** The restaurant's settings, as every screen needs them (part of `/me`): name and logo, tax, WhatsApp texts. */
export default interface RestaurantSettings {
  restaurantName: string;
  /** The logo's URL. Shown on receipts and in the app. */
  logo?: string;
  onboarded: boolean;
  /** False until the tax rates are saved in the first-run setup. */
  taxSet: boolean;
  /** Tax percentage charged for each payment method, e.g. { cash: 16, card: 5 }. */
  taxByPaymentMethod: Record<'cash' | 'card' | 'jazzcash' | 'easypaisa' | 'bank', number>;
  whatsappTemplates: Record<'winback' | 'reservation', string>;
  /** Tax numbers and a closing line printed on customer receipts; each is left off while empty (all of it in `/me`). */
  receipt?: { ntn?: string; strn?: string; footer?: string };
  /** When the settings were last saved (ISO). */
  updatedAt?: string;
}
