import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type BaseSyntheticEvent } from 'react';
import { useForm, type FieldValues, type Resolver } from 'react-hook-form';
import type FormProps from '../../types/form_props';
import type FormStatus from '../../types/form_status';
import getAxiosMessage from '../../utils/get_axios_message';


export default function Form({ component, onSubmit, defaultValues, schema, ...props }: FormProps) {
  const { register, handleSubmit, formState, reset, setError, setValue, getFieldState, watch, control } = useForm<FieldValues>({
    defaultValues,
    resolver: schema ? (zodResolver(schema) as Resolver<FieldValues>) : undefined,
  });
  const [status, setStatus] = useState<FormStatus>({});

  const submit = async (data: FieldValues, event?: BaseSyntheticEvent) => {
    event?.stopPropagation();
    if (status.loading || !onSubmit) return;

    setStatus({ loading: true });
    try {
      await onSubmit({
        data,
        onProgress: (message) => setStatus({ loading: true, message }),
        setValue: (name, value) => setValue(name, value),
        onSuccess: (message) => setStatus({ message }),
        onError: (error) => setStatus({ error: getAxiosMessage(error) }),
        onReset: () => {
          reset();
          setStatus({});
        },
        setError: (name, message) => {
          setStatus({});
          setError(name, { message });
        },
      });
    } catch (err) {
      setStatus({ error: getAxiosMessage(err) });
    }
  };

  const handleFormSubmit = (event?: BaseSyntheticEvent) => {
    // Record which named submit button was used, e.g. <button name="intent" value="draft">.
    const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter;
    if ((submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) && submitter.name) {
      setValue(submitter.name, submitter.value, { shouldDirty: true });
    }

    return handleSubmit(submit)(event);
  };

  return (
    <form {...props} onSubmit={handleFormSubmit}>
      {component({
        register,
        errors: formState.errors,
        ...status,
        setValue,
        getFieldState,
        watch,
        control,
        onSubmit: handleFormSubmit,
      })}
    </form>
  );
}
