import { Check } from 'lucide-react';
import type ChoiceFieldProps from '../types/choice_field_props';
import ChoiceField from './choice_field';

type CheckboxProps = ChoiceFieldProps;

export default function Checkbox(props: CheckboxProps) {
  return (
    <ChoiceField
      type="checkbox"
      inputClassName="peer size-5 appearance-none rounded-chip border border-border-strong bg-surface checked:border-primary checked:bg-primary transition-colors cursor-pointer hover:border-muted disabled:opacity-50 disabled:cursor-not-allowed"
      indicator={
        <Check
          size={14}
          aria-hidden="true"
          className="absolute text-on-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
        />
      }
      {...props}
    />
  );
}
