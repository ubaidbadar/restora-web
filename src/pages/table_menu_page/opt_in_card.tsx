import { MessageCircle } from 'lucide-react';
import api from '../../config/api';
import Button from '../../ui/button';
import Checkbox from '../../ui/checkbox';
import Form from '../../ui/form';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import optInSchema from './opt_in_schema';

interface OptInCardProps {
  restaurantName: string;
}

/** "Get offers on WhatsApp": the guest leaves their number by choice. The thank-you replaces the form. */
export default function OptInCard({ restaurantName }: OptInCardProps) {
  return (
    <section aria-labelledby="opt-in-title" className="rounded-card bg-surface p-4 shadow-card">
      <h2 id="opt-in-title" className="flex items-center gap-2">
        <MessageCircle size={20} aria-hidden="true" className="text-success-700" />
        Get offers on WhatsApp
      </h2>
      <Form
        schema={optInSchema}
        noValidate
        className="mt-3 flex flex-col gap-3"
        onSubmit={({ data, onSuccess, onError }) => {
          const code = window.location.pathname.split('/t/')[1] || '';
          api
            .post(`/public/t/${code}/opt-in`, data)
            .then(() => onSuccess(`Thank you! ${restaurantName} will send you offers on WhatsApp.`))
            .catch(onError);
        }}
        component={({ register, errors, loading, message, error }) =>
          message ? (
            <p role="status" className="rounded-control bg-success-50 px-3 py-2.5 text-sm font-medium text-success-700">
              {message}
            </p>
          ) : (
            <>
              <p className="text-sm text-body">Deals and new dishes from {restaurantName}, now and then. Your number stays with the restaurant.</p>
              <Input label="Your name (optional)" dir="auto" autoComplete="name" {...register('name')} />
              <Input label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" required {...register('phone')} error={fieldError(errors, 'phone')} />
              <Checkbox label={`Send me offers from ${restaurantName} on WhatsApp`} {...register('consent')} error={fieldError(errors, 'consent')} />
              {error && <p role="alert" className="text-sm font-medium text-danger-700">{error}</p>}
              <Button type="submit" disabled={loading}>
                Get offers
              </Button>
            </>
          )
        }
      />
    </section>
  );
}
