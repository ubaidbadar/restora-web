import { type LucideIcon } from 'lucide-react';
import type Permission from '@shared/permission';

export default interface NavLinkItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Match the path exactly (needed for "/"). */
  end?: boolean;
  /** Shown only to people with this permission. */
  permission?: Permission;
  /** Hidden on a shared POS terminal. */
  webOnly?: boolean;
}
