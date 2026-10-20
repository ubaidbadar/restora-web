import type { zodResolver } from '@hookform/resolvers/zod';
import type { FormHTMLAttributes, ReactNode } from 'react';
import type {
    FieldValues
} from 'react-hook-form';
import type FormComponentProps from './form_component_props';

interface SubmitProps {
  data: FieldValues;
  onSuccess: (message: string) => void;
  onError: (error: unknown) => void;
  onReset: () => void;
  setError: (name: string, error: string) => void;
  onProgress: (message: string) => void;
  /** Changes a field, e.g. clears a wrong PIN so it can be typed again. */
  setValue: (name: string, value: unknown) => void;
}

export default interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  component: (props: FormComponentProps) => ReactNode;
  onSubmit?: (data: SubmitProps) => void | Promise<void>;
  defaultValues?: FieldValues;
  schema?: Parameters<typeof zodResolver>[0];
}
