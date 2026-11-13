import type PaymentMethod from './payment_method';
import type TemplateKey from './template_key';

export default interface Settings {
  restaurantName: string;
  /** The logo's URL (a data URL while a new one is picked and not saved yet). Shown on receipts and in the app. */
  logo?: string;
  /** False until the owner has finished the first-run setup. */
  onboarded: boolean;
  /** True once the tax rates were saved in the first-run setup. */
  taxSet: boolean;
  /** Tax percentage charged for each payment method, e.g. { cash: 16, card: 5 }. */
  taxByPaymentMethod: Record<PaymentMethod, number>;
  dineInServiceCharge: { enabled: boolean; type: 'percentage' | 'fixed'; value: number; taxable: boolean };
  whatsappTemplates: Record<TemplateKey, string>;
  /** Tax numbers and a closing line printed on customer receipts; each is left off while empty. */
  receipt?: { ntn?: string; strn?: string; footer?: string };
  /** When the settings were last saved. */
  updatedAt?: string;
}
