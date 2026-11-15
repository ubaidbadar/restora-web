import { useState } from 'react';
import Input from '../ui/input';

interface PriorityInputProps {
  value: number;
  max: number;
  label: string;
  onSave: (priority: number) => Promise<void>;
}

/** A compact 1-based position field that saves when it loses focus. */
export default function PriorityInput({ value, max, label, onSave }: PriorityInputProps) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="w-10 shrink-0">
      <Input
        key={`${value}:${max}`}
        type="number"
        min={1}
        max={max}
        step={1}
        defaultValue={value}
        aria-label={`Priority for ${label}`}
        title={`Priority for ${label}`}
        className="px-0.5 text-center tabular-nums"
        disabled={saving}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onBlur={async (event) => {
          const input = event.currentTarget;
          const next = input.valueAsNumber;
          if (!Number.isInteger(next) || next < 1 || next > max || next === value) {
            input.value = String(value);
            return;
          }

          setSaving(true);
          try {
            await onSave(next);
          } catch {
            input.value = String(value);
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
