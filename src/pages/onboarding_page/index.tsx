import { Link, useNavigate } from 'react-router';
import SetupForm from '../../components/setup_form';
import SetupShell from '../../components/setup_shell';
import Button from '../../ui/button';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import api from '../../config/api';
import useAuthStore from '../../store/auth_store';
import onboardingSchema from './schema';

/**
 * Setup step 1: the restaurant and its first branch. The server adds the five preset roles and makes you the owner;
 * the setup then continues with tax and the menu on /welcome.
 */
export default function OnboardingPage() {
  const navigate = useNavigate();
  return (
    <SetupShell
      step={1}
      title="Create your restaurant"
      description="You'll be its owner. Add more branches and invite your team later."
      footer={
        <>
          Joining someone else's restaurant?{' '}
          <Button as={Link} to="/restaurants" variant="primaryLink">
            See your invitations
          </Button>
        </>
      }
    >
      <SetupForm
        schema={onboardingSchema}
        defaultValues={{ branchName: 'Main branch' }}
        submitLabel="Create restaurant"
        busyLabel="Creating restaurant…"
        onSubmit={({ data, onSuccess, onError }) =>
          api
            .post('/onboarding', data)
            .then((res) => {
              // The server made it the restaurant this sign-in works in.
              useAuthStore.getState().setMe(res.data.me);
              onSuccess('');
              navigate('/welcome', { replace: true });
            })
            .catch(onError)
        }
        fields={({ register, errors }) => (
          <>
            <Input label="Restaurant name" dir="auto" required autoFocus placeholder="e.g. Tandoor House" {...register('name')} error={fieldError(errors, 'name')} />

            <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
              <legend className="float-start mb-1 w-full">
                <span className="block text-sm font-semibold text-ink">First branch</span>
                <span className="block text-sm text-muted">Where orders and reservations will be taken.</span>
              </legend>
              <Input label="Branch name" dir="auto" required {...register('branchName')} error={fieldError(errors, 'branchName')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Area" dir="auto" placeholder="e.g. Gulberg III" {...register('area')} />
                <Input label="City" dir="auto" placeholder="e.g. Lahore" {...register('city')} />
              </div>
              <Input label="Branch phone (optional)" type="tel" inputMode="tel" {...register('phone')} error={fieldError(errors, 'phone')} />
            </fieldset>

            <p className="rounded-control bg-primary-soft px-3 py-2.5 text-sm text-body">
              We'll also add five ready roles (Owner, Manager, Cashier, Waiter, Kitchen) that you can edit.
            </p>
          </>
        )}
      />
    </SetupShell>
  );
}
