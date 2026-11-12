import useGet from '../../hooks/useGet';
import useWorkplace from '../../hooks/useWorkplace';
import WhatsAppSignupButton from '../../components/whatsapp_signup_button';
import SkeletonList from '../../components/skeleton_list';
import LoadFailed from '../../components/load_failed';
import Button from '../../ui/button';

type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };
type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending' };

interface StepWhatsAppProps {
  onSkip: () => void;
  onAuthorized: (status: SignupResult['status']) => void;
}

function ConnectRestaurantWhatsApp({ appId, configId, onAuthorized }: {
  appId: string; configId: string; onAuthorized: StepWhatsAppProps['onAuthorized'];
}) {
  const workplace = useWorkplace();
  if (!workplace?.branch?._id) return (
    <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
      Select your restaurant branch before connecting WhatsApp.
    </p>
  );
  return <WhatsAppSignupButton appId={appId} configId={configId} branchId={workplace.branch._id}
    hasConnection={false} onConnected={result => onAuthorized(result.status)} />;
}

/** The fourth setup step is optional. Restaurants can connect through Settings later. */
export default function StepWhatsApp({ onSkip, onAuthorized }: StepWhatsAppProps) {
  const { data, loading, error, get } = useGet<SignupConfig>('/whatsapp/signup/config');

  return (
    <>
      <div className="flex flex-col gap-4 px-5 py-6 sm:px-7">
        {loading && !data && <SkeletonList rows={3} variant="lines" />}
        {error && !data && <LoadFailed what="WhatsApp connection settings" onRetry={() => get()} />}
        {data && !data.enabled && <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
          WhatsApp connection isn't available right now. You can finish setup and connect later from Settings.
        </p>}
        {data?.enabled && data.appId && data.configId &&
          <ConnectRestaurantWhatsApp appId={data.appId} configId={data.configId} onAuthorized={onAuthorized} />}
        <p className="rounded-control bg-primary-soft px-3 py-2.5 text-sm text-body">
          Not ready? You can connect anytime from Settings → WhatsApp connection.
        </p>
      </div>
      <footer className="flex justify-end border-t border-border bg-sunken/50 px-5 py-4 sm:px-7">
        <Button variant="outline" onClick={onSkip}>Skip for now</Button>
      </footer>
    </>
  );
}
