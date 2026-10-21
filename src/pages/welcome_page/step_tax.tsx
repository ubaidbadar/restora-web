import type Workplace from '@shared/workplace';
import api from '../../config/api';
import SetupForm from '../../components/setup_form';
import TaxFields from '../../components/tax_fields';
import useAuthStore from '../../store/auth_store';
import taxStepSchema from './tax_step_schema';

interface StepTaxProps {
  settings: Workplace['settings'];
  onSaved?: () => void;
}

/** Setup step 2: tax by payment method. The saved settings (tax set) go in the store, which moves the setup on. */
export default function StepTax({ settings, onSaved }: StepTaxProps) {
  return (
    <SetupForm
      schema={taxStepSchema}
      defaultValues={{ taxByPaymentMethod: settings.taxByPaymentMethod }}
      submitLabel="Continue"
      onSubmit={({ data, onSuccess, onError }) =>
        api
          .patch('/settings', { taxByPaymentMethod: data.taxByPaymentMethod })
          .then((res) => {
            onSuccess('');
            useAuthStore.getState().setSettings(res.data);
            onSaved?.();
          })
          .catch(onError)
      }
      fields={({ register, errors }) => (
        <>
          <TaxFields register={register} errors={errors} />
          <p className="text-sm text-muted">Not sure? Check these with your accountant; you can change them any time in Settings.</p>
        </>
      )}
    />
  );
}
