import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type FormComponentProps from '../types/form_component_props';
import type FormProps from '../types/form_props';
import type OverlayProps from '../types/overlay_props';
import Button from '../ui/button';
import Drawer from '../ui/drawer';
import Form from '../ui/form';

interface FormDrawerPanelProps extends OverlayProps {
  title: string;
  schema: FormProps['schema'];
  defaultValues?: FieldValues;
  submitLabel?: string;
  /** What the button says while saving. */
  busyLabel?: string;
  /** The inputs. They receive `register`, `errors` and the rest from `Form`. */
  fields: (form: FormComponentProps) => ReactNode;
  /** Receives validated values. When it throws (the server refused), the drawer stays open and shows why. Without it the drawer just closes. */
  onSave?: (values: FieldValues) => unknown;
}

/** A drawer with one form in it. It closes itself when `onSave` succeeds. */
export default function FormDrawerPanel({ title, schema, defaultValues, submitLabel = 'Save', busyLabel = 'Saving…', fields, onSave, ...overlay }: FormDrawerPanelProps) {
  return (
    <Drawer {...overlay} title={title}>
      <Form
        schema={schema}
        defaultValues={defaultValues}
        noValidate
        className="flex flex-1 flex-col gap-4"
        onSubmit={async ({ data, onReset }) => {
          await onSave?.(data);
          onReset();
          overlay.close();
        }}
        component={(form) => (
          <>
            {fields(form)}
            {/* The server's answer sits in the sticky footer, above Save, so it is in view however long the form is. */}
            <div className="sticky -bottom-5 -mx-5 -mb-5 mt-auto flex flex-col gap-3 border-t border-border bg-surface px-5 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6">
              {form.error && (
                <p role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">
                  {form.error}
                </p>
              )}
              <Button type="submit" size="lg" disabled={form.loading} aria-busy={form.loading} className="w-full">
                {form.loading ? busyLabel : submitLabel}
              </Button>
            </div>
          </>
        )}
      />
    </Drawer>
  );
}
