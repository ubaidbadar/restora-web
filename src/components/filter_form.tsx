import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type FormComponentProps from '../types/form_component_props';
import type FormProps from '../types/form_props';
import Button from '../ui/button';
import Form from '../ui/form';

interface FilterFormProps {
  schema: FormProps['schema'];
  defaultValues?: FieldValues;
  submitLabel?: string;
  /** The inputs. They receive `register` and the rest from `Form`. */
  fields: (form: FormComponentProps) => ReactNode;
  onSave: (values: FieldValues) => void;
  close: () => void;
}

/** A filter's fields, scrolling when they are many, and Apply kept in reach below them (above the home indicator on a phone). */
export default function FilterForm({ schema, defaultValues, submitLabel = 'Apply', fields, onSave, close }: FilterFormProps) {
  return (
    <Form
      schema={schema}
      defaultValues={defaultValues}
      noValidate
      className="flex min-h-0 flex-col"
      onSubmit={({ data }) => {
        onSave(data);
        close();
      }}
      component={(form) => (
        <>
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-5">{fields(form)}</div>
          <div className="shrink-0 border-t border-border px-5 pt-4 pb-safe sm:pb-4">
            <Button type="submit" className="w-full">
              {submitLabel}
            </Button>
          </div>
        </>
      )}
    />
  );
}
