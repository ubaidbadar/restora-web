import { useNavigate } from 'react-router';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import useAuthStore from '../../../store/auth_store';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import toast from '../../../utils/toast';
import confirmNameSchema from './confirm_name_schema';

/** Deletes the restaurant after 30 days. Everyone loses access at once; the owner can still keep it from Restaurants. */
export default function DeleteRestaurant() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 flex-1 basis-60">
        <p className="font-medium text-danger-700">Delete restaurant</p>
        <p className="text-sm text-muted">Nobody can work in it from now on. Everything is deleted for good after 30 days; until then you can cancel.</p>
      </div>
      <FormDrawer
        title="Delete restaurant"
        schema={confirmNameSchema}
        submitLabel="Delete restaurant"
        onSave={(values) =>
          api.post('/restaurant/delete', values).then((res) => {
            useAuthStore.getState().setMe(res.data.me);
            toast.success('The restaurant will be deleted in 30 days. You can cancel from Restaurants.');
            navigate('/restaurants', { replace: true });
          })
        }
        fields={({ register, errors }) => <Input label="Type the restaurant name to confirm" required {...register('confirmName')} error={fieldError(errors, 'confirmName')} />}
        component={({ open }) => <Button variant="danger" onClick={open}>Delete…</Button>}
      />
    </div>
  );
}
