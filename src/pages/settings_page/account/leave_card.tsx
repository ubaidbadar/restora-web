import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import useAuthStore from '../../../store/auth_store';
import useWorkplace from '../../../hooks/useWorkplace';
import AlertModal from '../../../ui/alert_modal/modal';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import getAxiosMessage from '../../../utils/get_axios_message';

/** Stop working at this restaurant. The owner can't leave; they transfer ownership first (Restaurant tab). */
export default function LeaveCard() {
  const navigate = useNavigate();
  const workplace = useWorkplace();
  if (!workplace || workplace.isPrimaryOwner) return null;
  const name = workplace.restaurant.name;

  const leave = () =>
    api
      .post('/restaurant/leave')
      .then((res) => {
        useAuthStore.getState().setMe(res.data.me);
        toast.success(`You left ${name}`);
        navigate('/restaurants', { replace: true });
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <SectionCard title={`Leave ${name}`} description="You stop being part of its team here. Your account stays, with any other restaurants you work at.">
      <AlertModal
        title={`Leave ${name}?`}
        description="You lose access to its orders, customers and settings at once. To come back, someone there has to invite you again."
        confirmText="Leave restaurant"
        cancelText="Stay"
        onConfirm={leave}
        component={({ open }) => (
          <Button variant="danger" icon={LogOut} onClick={open}>
            Leave restaurant
          </Button>
        )}
      />
    </SectionCard>
  );
}
