import { type InputHTMLAttributes, type ReactNode } from 'react';

export default interface ChoiceFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
}
