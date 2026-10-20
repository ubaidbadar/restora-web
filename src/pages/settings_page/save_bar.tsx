import { useFormState, type Control, type FieldValues } from 'react-hook-form';
import LeaveGuard from '../../components/leave_guard';
import Button from '../../ui/button';

interface SaveBarProps {
  control: Control<FieldValues>;
  loading?: boolean;
}

/** The footer of a settings section: says when something is unsaved, saves, and guards against leaving. */
export default function SaveBar({ control, loading }: SaveBarProps) {
  const { isDirty } = useFormState({ control });

  return (
    <>
      <p role="status" className="me-auto text-sm font-medium text-warning-800">{isDirty && 'You have unsaved changes'}</p>
      <Button type="submit" disabled={loading}>
        Save changes
      </Button>
      <LeaveGuard when={isDirty} />
    </>
  );
}
