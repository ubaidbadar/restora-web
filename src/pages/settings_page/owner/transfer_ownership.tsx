import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import Toggle from '../../../ui/toggle';
import fieldError from '../../../utils/field_error';
import useAuthStore from '../../../store/auth_store';
import toast from '../../../utils/toast';
import TransferTarget from './transfer_target';
import transferSchema from './transfer_schema';

/** Makes someone else the owner of the restaurant. You can stay a co-owner, or become a manager. */
export default function TransferOwnership() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 flex-1 basis-60">
        <p className="font-medium text-ink">Transfer ownership</p>
        <p className="text-sm text-muted">The new owner can transfer or delete the restaurant. You can't undo this yourself.</p>
      </div>
      <FormDrawer
        title="Transfer ownership"
        schema={transferSchema}
        defaultValues={{ keepMeAsOwner: true }}
        submitLabel="Transfer"
        onSave={(values) =>
          api
            .post('/restaurant/transfer', values)
            .then((res) => {
              // What you may do here changes with it.
              useAuthStore.getState().setMe(res.data.me);
              toast.success('Ownership transferred');
            })
        }
        fields={({ register, errors }) => (
          <>
            <TransferTarget register={register} errors={errors} />
            <Toggle label="Keep me as a co-owner" {...register('keepMeAsOwner')} />
            <Input label="Type the restaurant name to confirm" required {...register('confirmName')} error={fieldError(errors, 'confirmName')} />
          </>
        )}
        component={({ open }) => <Button variant="outline" onClick={open}>Transfer…</Button>}
      />
    </div>
  );
}
