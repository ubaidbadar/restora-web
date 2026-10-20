import { MessageCircle } from 'lucide-react';
import type ButtonProps from '../types/button_props';
import Button from '../ui/button';
import waLink from '../utils/wa_link';

interface WhatsAppLinkProps {
  phone: string;
  message?: string;
  children: string;
  variant?: ButtonProps['variant'];
  /** Runs as the link opens, e.g. to mark the customer as sent. */
  onOpen?: () => void;
}

/** Opens WhatsApp in a new tab with the message already typed. The user presses send there. */
export default function WhatsAppLink({ phone, message, children, variant = 'outline', onOpen }: WhatsAppLinkProps) {
  return (
    <Button
      as="a"
      href={waLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      icon={MessageCircle}
      variant={variant}
      className="min-h-11 shrink-0"
      onClick={onOpen}
    >
      {children}
    </Button>
  );
}
