import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../../config/api';
import CustomerFields from '../../../components/customer_fields';
import FormDrawer from '../../../components/form_drawer';
import customerSchema from '../../../constants/customer_schema';
import useGet from '../../../hooks/useGet';
import getCache from '../../../store/get_cache';
import useOutboxStore from '../../../store/outbox_store';
import type Customer from '../../../types/customer';
import type Order from '../../../types/order';
import type FormComponentProps from '../../../types/form_component_props';
import SearchMenu from '../../../ui/search_menu';
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

/**
 * Find the customer by number or name (ui/search_menu), or save a new number on the spot. The search text is local,
 * so typing re-renders this section only; the form gets the picked customer.
 */
function Main({ setValue, picked }: FormComponentProps & { picked?: Order['customer'] }) {
  const [search, setSearch] = useState('');
  // Editing an order starts with its customer picked: the full record when the customer list is already loaded.
  const [customer, setCustomer] = useState<Customer | null>(() =>
    picked
      ? ((getCache.get(getCache.keyOf('/customers')) as Customer[] | undefined)?.find((saved) => saved._id === picked._id) ??
        { _id: picked._id, name: picked.name, phone: picked.phone, tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: '' })
      : null,
  );

  const term = search.trim();
  const query = term.toLowerCase();
  const byName = /\p{L}/u.test(query);
  const digits = national(query);
  // Results from the first letter or digit.
  const searching = byName || /\d/.test(query);
  const online = useOutboxStore((state) => state.online);

  // The saved list answers at once and offline. It holds the 1,000 most recent customers, so while online the server is
  // also asked (`q`), a moment after typing stops, for anyone older; its answer is filtered again below, so a late
  // answer to an earlier search never shows wrong people.
  const { data: list, loading } = useGet<Customer[]>('/customers', { active: !searching });
  const { data: older, loading: searchingServer, get: askFor } = useGet<Customer[]>('/customers', { active: true });
  const isMatch = (customer: Customer) =>
    byName ? customer.name.toLowerCase().includes(query) : national(customer.phone).includes(digits) || national(customer.altPhone ?? '').includes(digits);
  const local = searching ? (list ?? []).filter(isMatch) : [];
  const fromServer = searching ? (older ?? []).filter((customer) => isMatch(customer) && !local.some((saved) => saved._id === customer._id)) : [];
  const matches = [...local, ...fromServer].slice(0, MAX_MATCHES);
  // From two characters: one letter would bring back nearly everyone.
  const askServer = searching && term.length >= 2 && online && local.length < MAX_MATCHES;

  useEffect(() => {
    if (!askServer) return;
    const timer = setTimeout(() => askFor({ params: { q: term } }), 350);
    return () => clearTimeout(timer);
  }, [askServer, term, askFor]);

  const fullNumber = byName ? null : normalizePhone(term);
  // The last row always offers a new customer, with what was typed filled in: a name, or the number (whole or part).
  // Only a full number someone already has (as their number or second number) leaves it out: that person is listed.
  const taken = Boolean(fullNumber) && matches.some((match) => match.phone === fullNumber || national(match.altPhone ?? '') === national(fullNumber!));
  const typed = fullNumber ? formatPhone(fullNumber) : term;
  const newCustomer = byName ? { name: term, phone: '' } : { name: '', phone: typed };

  const pick = (chosen: Customer) => {
    setValue('customerId', chosen._id, { shouldDirty: true });
    setValue('newName', undefined);
    setValue('newPhone', undefined);
    setCustomer(chosen);
    setSearch('');
  };

  const clear = () => {
    setValue('customerId', undefined, { shouldDirty: true });
    setValue('newName', undefined);
    setValue('newPhone', undefined);
    setCustomer(null);
  };

  if (customer) return <CustomerMatchCard customer={customer} onClear={clear} />;

  return (
    <FormDrawer
      title="New customer"
      schema={customerSchema}
      defaultValues={newCustomer}
      submitLabel="Save and pick"
      onSave={(values) =>
        api
          .post('/customers', values)
          .then((res) => {
            getCache.update<Customer[]>(getCache.keyOf('/customers'), (current) => (current ? [res.data, ...current] : current));
            pick(res.data);
          })
          .catch(async (err) => {
            // Saved already (found only by the server, or added on another device): pick that customer instead.
            if (err.response?.status === 409) {
              const { data: found } = await api.get<Customer[]>('/customers', { params: { q: values.phone } });
              const existing = found.find((customer) => customer.phone === normalizePhone(values.phone));
              if (!existing) throw err;
              toast.info(`${existing.name} is already saved with this number, so they are picked`);
              return pick(existing);
            }
            if (err.response) throw err;
            // No internet: the order carries the name and number, and the server saves the customer when it arrives.
            const phone = normalizePhone(values.phone) ?? '';
            pick({ _id: '', name: values.name, phone, area: values.area, tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: new Date().toISOString() });
            setValue('customerId', undefined);
            setValue('newName', values.name);
            setValue('newPhone', phone);
          })
      }
      fields={(form) => <CustomerFields {...form} />}
      component={({ open: addNew }) => (
        <SearchMenu
          value={search}
          onChange={setSearch}
          items={searching ? matches : undefined}
          getKey={(match) => match._id}
          renderItem={(match) => <CustomerResult customer={match} query={byName ? query : ''} />}
          onPick={pick}
          action={taken ? undefined : { icon: UserPlus, label: matches.length ? `New customer “${typed}”` : `No match. Add “${typed}” as a new customer`, onSelect: addNew }}
          loading={!matches.length && ((loading && !list) || (askServer && searchingServer))}
          label="Find customer by phone number or name"
          placeholder="Phone number or name"
        />
      )}
    />
  );
}

export default function CustomerStep(props: FormComponentProps & { picked?: Order['customer'] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-heading text-ink">
        Customer <span className="text-sm font-normal text-muted">· optional for walk-ins</span>
      </h2>
      <Main {...props} />
    </section>
  );
}
