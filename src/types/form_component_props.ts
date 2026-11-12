import type { BaseSyntheticEvent } from 'react';
import type {
    Control,
    FieldErrors,
    FieldValues,
    UseFormRegister,
    FormState,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import type FormStatus from './form_status';

export default interface FormComponentProps extends FormStatus {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  dirtyFields: FormState<FieldValues>['dirtyFields'];
  watch: UseFormWatch<FieldValues>;
  control: Control<FieldValues>;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
}
