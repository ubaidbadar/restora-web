import { type ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type FormComponentProps from '../types/form_component_props';
import type FormProps from '../types/form_props';
import Button from '../ui/button';
import Form from '../ui/form';

interface SetupFormProps {
  schema: FormProps['schema'];
  defaultValues?: FieldValues;
  submitLabel: string;
  /** What the button says while saving, e.g. "Signing in…", so a slow connection never looks like a dead click. */
  busyLabel?: string;
  fields: (form: FormComponentProps) => ReactNode;
  onSubmit: NonNullable<FormProps['onSubmit']>;
  /** Shows a Back button in the footer. */
  onBack?: () => void;
}

/** A setup step's form inside SetupShell's card: fields, then a footer bar with Back and the main action. */
export default function SetupForm({ schema, defaultValues, submitLabel, busyLabel = 'Saving…', fields, onSubmit, onBack }: SetupFormProps) {
  return (
    <Form
      schema={schema}
      defaultValues={defaultValues}
      noValidate
      onSubmit={onSubmit}
      component={(form) => (
        <>
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-7">
            {fields(form)}
            {form.error && <p role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">{form.error}</p>}
          </div>
          <footer className="flex items-center justify-between gap-3 rounded-b-card border-t border-border bg-sunken/50 px-5 py-4 sm:px-7">
            {onBack ? (
              <Button type="button" variant="ghost" onClick={onBack}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="lg" disabled={form.loading} aria-busy={form.loading}>
              {form.loading ? busyLabel : submitLabel}
            </Button>
          </footer>
        </>
      )}
    />
  );
}
