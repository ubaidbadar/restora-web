import { type ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type FormComponentProps from '../types/form_component_props';
import type FormProps from '../types/form_props';
import Button from '../ui/button';
import Form from '../ui/form';

interface AuthFormProps {
  schema: FormProps['schema'];
  defaultValues?: FieldValues;
  submitLabel: string;
  /** What the button says while saving, e.g. "Signing in…", so a slow connection never looks like a dead click. */
  busyLabel?: string;
  fields: (form: FormComponentProps) => ReactNode;
  /** Form's `onSubmit`: gets `{ data, onSuccess, onError, … }`. An error passed to `onError` (or thrown) shows above the button. */
  onSubmit: NonNullable<FormProps['onSubmit']>;
}

/** The form shell shared by sign in, sign up and the first-run setup steps. */
export default function AuthForm({ schema, defaultValues, submitLabel, busyLabel = 'Please wait…', fields, onSubmit }: AuthFormProps) {
  return (
    <Form
      schema={schema}
      defaultValues={defaultValues}
      noValidate
      className="flex flex-col gap-4"
      onSubmit={onSubmit}
      component={(form) => (
        <>
          {fields(form)}
          {form.error && <p role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">{form.error}</p>}
          <Button type="submit" size="lg" disabled={form.loading} aria-busy={form.loading} className="mt-1 w-full">
            {form.loading ? busyLabel : submitLabel}
          </Button>
        </>
      )}
    />
  );
}
