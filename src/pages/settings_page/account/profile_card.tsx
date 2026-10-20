import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import useAuthStore from '../../../store/auth_store';
import Button from '../../../ui/button';
import Form from '../../../ui/form';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import toast from '../../../utils/toast';
import profileSchema from './profile_schema';

/** Your name, as your team sees it. Your email is how you sign in. */
export default function ProfileCard() {
  const me = useAuthStore((state) => state.me);
  if (!me) return null;
  return (
    <Form
      key={me.user.name}
      schema={profileSchema}
      defaultValues={{ name: me.user.name }}
      noValidate
      onSubmit={({ data, onSuccess, onError }) =>
        api
          .patch('/me/profile', data)
          .then((res) => {
            useAuthStore.getState().setMe({ ...me, user: { ...me.user, name: res.data.name } });
            onSuccess('');
            toast.success('Name saved');
          })
          .catch(onError)
      }
      component={({ register, errors, loading, error }) => (
        <SectionCard title="Your profile" description={`You sign in with ${me.user.email}.`} footer={<Button type="submit" disabled={loading}>Save</Button>}>
          <Input label="Your name" dir="auto" required {...register('name')} error={fieldError(errors, 'name') ?? error} />
        </SectionCard>
      )}
    />
  );
}
