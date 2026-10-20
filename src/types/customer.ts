import type LastOrder from './last_order';

export default interface Customer {
  _id: string;
  name: string;
  /** Normalized mobile, +923XXXXXXXXX. */
  phone: string;
  altPhone?: string;
  /** Not sent in list responses; present after the profile has loaded. */
  addresses?: string[];
  area?: string;
  /** Not sent in list responses; present after the profile has loaded. */
  notes?: string;
  tags: string[];
  /** Rupees the customer owes. */
  khataBalance: number;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  /** What they had last time, kept on the customer. */
  lastOrder?: LastOrder;
  /** How they were added. */
  source?: 'staff' | 'qr' | 'import';
  /** Agreed to get offers on WhatsApp. */
  whatsappOptIn?: { at: string; source: string };
  createdAt: string;
}
