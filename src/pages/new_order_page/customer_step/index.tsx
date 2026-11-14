import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import can from '@shared/can';
import api from '../../../config/api';
import CustomerFields from '../../../components/customer_fields';
import FormDrawer from '../../../components/form_drawer';
import customerSchema from '../../../constants/customer_schema';
import useGet from '../../../hooks/useGet';
import getCache from '../../../store/get_cache';
import completeAddress from '../../../utils/complete_address';
import useAuthStore from '../../../store/auth_store';
import useOutboxStore from '../../../store/outbox_store';
import type Customer from '../../../types/customer';
import type Order from '../../../types/order';
import type FormComponentProps from '../../../types/form_component_props';
import SearchMenu from '../../../ui/search_menu';
import ModalOverlay from '../../../ui/modal/modal';
import Button from '../../../ui/button';
import formatPhone from '../../../utils/format_phone';
import normalizePhone from '../../../utils/normalize_phone';
import toast from '../../../utils/toast';
import CustomerMatchCard from './customer_match_card';
import CustomerResult from './customer_result';

const MAX_MATCHES = 6;

/**
 * The digits of a mobile number without its country or trunk prefix, so "0300-1234567", "+923001234567" and a second
 * number saved as typed all compare alike. The prefix is only dropped before a 3, where Pakistani mobiles start.
 */
const national = (phone: string) => phone.replace(/\D/g, '').replace(/^(?:0092|92|0)(?=3)/, '');

/** Customer selection is separate from order type: the checkout header opens a short, searchable picker. */
function Main({ setValue, watch, control, picked }: FormComponentProps & { picked?: Order['customer'] }) {
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(() =>
    picked?._id
      ? ((getCache.get(getCache.keyOf('/customers')) as Customer[] | undefined)?.find((saved) => saved._id === picked._id) ??
        { _id: picked._id, name: picked.name, phone: picked.phone ?? '', tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: '' })
      : null,
  );
  const customerId = useWatch({ control, name: 'customerId' });
  const customerName = useWatch({ control, name: 'newName' });
  const customerPhone = useWatch({ control, name: 'newPhone' });

  const term = search.trim();
  const query = term.toLowerCase();
  const byName = /\p{L}/u.test(query);
  const digits = national(query);
  const searching = byName || /\d/.test(query);
  const online = useOutboxStore((state) => state.online);

  const { data: list, loading } = useGet<Customer[]>('/customers', { active: !searching });
  const { data: older, loading: searchingServer, get: askFor } = useGet<Customer[]>('/customers', { active: true });
  const isMatch = (saved: Customer) =>
    byName ? saved.name.toLowerCase().includes(query) : national(saved.phone).includes(digits) || national(saved.altPhone ?? '').includes(digits);
  const local = searching ? (list ?? []).filter(isMatch) : [];
  const fromServer = searching ? (older ?? []).filter((saved) => isMatch(saved) && !local.some((match) => match._id === saved._id)) : [];
  const matches = [...local, ...fromServer].slice(0, MAX_MATCHES);
  const askServer = searching && term.length >= 2 && online && local.length < MAX_MATCHES;

  useEffect(() => {
    if (!askServer) return;
    const timer = setTimeout(() => askFor({ params: { q: term } }), 350);
    return () => clearTimeout(timer);
  }, [askServer, term, askFor]);

  const fullNumber = byName ? null : normalizePhone(term);
  const taken = Boolean(fullNumber) && matches.some((match) => match.phone === fullNumber || national(match.altPhone ?? '') === national(fullNumber!));
  const typed = fullNumber ? formatPhone(fullNumber) : term;
  const newCustomer = byName ? { name: term, phone: '' } : { name: '', phone: typed };

  // The form values also restore the compact selected state when a phone sheet is closed and opened again.
  const fromCache = customerId
    ? (getCache.get(getCache.keyOf('/customers')) as Customer[] | undefined)?.find((saved) => saved._id === customerId)
    : undefined;
  const selectedCustomer = customer ?? fromCache ?? (customerId && customerName
    ? { _id: customerId, name: customerName, phone: customerPhone ?? '', tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: '' }
    : !customerId && customerName && customerPhone
      ? { _id: '', name: customerName, phone: customerPhone, tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: '' }
      : null);

  const clearPreviousDelivery = () => {
    if (watch('type') !== 'delivery') return;
    const previousId = watch('customerId');
    const previous = previousId
      ? getCache.get(getCache.keyOf(`/customers/${previousId}`)) as Customer | undefined
      : undefined;
    const address = completeAddress(previous?.addresses?.find((saved) => saved.trim()), previous?.area);
    if (!watch('address') || (address && watch('address') === address)) setValue('address', '');
  };

  const pick = (chosen: Customer, close: () => void) => {
    if (watch('customerId') !== chosen._id) clearPreviousDelivery();
    setValue('customerId', chosen._id, { shouldDirty: true });
    setValue('newName', chosen.name);
    setValue('newPhone', undefined);
    setCustomer(chosen);
    setSearch('');
    close();
  };

  const clear = () => {
    clearPreviousDelivery();
    setValue('customerId', undefined, { shouldDirty: true });
    if (selectedCustomer && watch('newName') === selectedCustomer.name) setValue('newName', undefined);
    setValue('newPhone', undefined);
    setCustomer(null);
  };

  return (
    <ModalOverlay
      title="Select customer"
      component={({ open }) => selectedCustomer
        ? <CustomerMatchCard customer={selectedCustomer} onClear={clear} />
        : (
          <Button type="button" variant="primaryLink" icon={UserPlus} className="text-sm" onClick={() => {
            setSearch('');
            open();
          }}>
            Add customer
          </Button>
        )}
    >
      {(close) => (
        <FormDrawer
          title="New customer"
          schema={customerSchema}
          defaultValues={newCustomer}
          submitLabel="Save and pick"
          onSave={(values) => {
            const carry = () => {
              const phone = normalizePhone(values.phone) ?? '';
              pick({ _id: '', name: values.name, phone, area: values.area, tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: new Date().toISOString() }, close);
              setValue('customerId', undefined);
              setValue('newName', values.name);
              setValue('newPhone', phone);
            };
            if (!can(useAuthStore.getState().me?.workplace, 'customers:manage')) return Promise.resolve(carry());
            return api
              .post('/customers', values)
              .then((res) => {
                getCache.update<Customer[]>(getCache.keyOf('/customers'), (current) => (current ? [res.data, ...current] : current));
                pick(res.data, close);
              })
              .catch(async (err) => {
                if (err.response?.status === 409) {
                  const { data: found } = await api.get<Customer[]>('/customers', { params: { q: values.phone } });
                  const existing = found.find((saved) => saved.phone === normalizePhone(values.phone));
                  if (!existing) throw err;
                  toast.info(`${existing.name} is already saved with this number, so they are picked`);
                  pick(existing, close);
                  return;
                }
                if (err.response) throw err;
                carry();
              });
          }}
          fields={(form) => <CustomerFields {...form} />}
          component={({ open: addNew }) => (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">Search by customer name or mobile number.</p>
              <SearchMenu
                value={search}
                onChange={setSearch}
                autoFocus
                items={searching ? matches : (list ?? []).slice(0, MAX_MATCHES)}
                getKey={(match) => match._id}
                renderItem={(match) => <CustomerResult customer={match} query={byName ? query : ''} />}
                onPick={(chosen) => pick(chosen, close)}
                action={term && !taken ? {
                  icon: UserPlus,
                  label: matches.length ? `New customer “${typed}”` : `No match. Add “${typed}” as a new customer`,
                  onSelect: addNew,
                } : undefined}
                loading={!matches.length && (searching ? askServer && searchingServer : loading && !list)}
                empty={searching ? 'No matching customers' : 'No saved customers yet'}
                label="Find customer by phone number or name"
                placeholder="Phone number or name"
              />
            </div>
          )}
        />
      )}
    </ModalOverlay>
  );
}

export default function CustomerStep({ picked, ...props }: FormComponentProps & { picked?: Order['customer'] }) {
  return <Main {...props} picked={picked} />;
}
