import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ElementType } from 'react';
import type buttonSizes from '../constants/button_sizes';
import type buttonVariants from '../constants/button_variants';

type ButtonBaseProps<T extends ElementType> = {
  as?: T;
  icon?: LucideIcon;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
};

type ButtonProps<T extends ElementType = 'button'> = ButtonBaseProps<T> & Omit<ComponentProps<T>, keyof ButtonBaseProps<T>>;

export default ButtonProps;
