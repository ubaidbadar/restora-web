import type { LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export default interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  rightElement?: ReactNode;
  error?: string;
  label?: string;
  required?: boolean;
}
