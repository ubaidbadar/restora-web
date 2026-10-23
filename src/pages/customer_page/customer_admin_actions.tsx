import { Ellipsis, Merge, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import can from '@shared/can';
import api from '../../config/api';
import useWorkplace from '../../hooks/useWorkplace';
import CustomerFields from '../../components/customer_fields';
import FormDrawer from '../../components/form_drawer';
import customerSchema from '../../constants/customer_schema';
import type Customer from '../../types/customer';
import AlertModal from '../../ui/alert_modal/modal';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';
import formatPhone from '../../utils/format_phone';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';
import MergeCustomer from './merge_customer';

interface CustomerAdminActionsProps {
  customer: Customer;
  /** Gets the customer after an edit or after another record was merged in. */
  onCustomer: (customer: Customer) => void;
}

/**
 * The ⋯ menu on a customer: edit, merge a duplicate into this record, or delete a record saved by mistake (only when it
 * has no history). Kept in a menu so the header stays about serving the customer.
 */
export default function CustomerAdminActions({ customer, onCustomer }: CustomerAdminActionsProps) {
  const navigate = useNavigate();
  const workplace = useWorkplace();
  const remove = () => {
    api
      .delete(`/customers/${customer._id}`)
      .then(() => {
        toast.success(`${customer.name} deleted`);
        navigate('/customers', { replace: true });
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };
  // The saved customer as the text the form inputs show.
  const editValues = {
    ...customer,
    phone: formatPhone(customer.phone),
    altPhone: customer.altPhone ? formatPhone(customer.altPhone) : '',
    tags: customer.tags.join(', '),
    addresses: (customer.addresses ?? []).join('\n'),
  };

  return (
    <FormDrawer
      title="Edit customer"
      schema={customerSchema}
      defaultValues={editValues}
      onSave={(values) =>
        api.patch(`/customers/${customer._id}`, values).then((res) => {
          onCustomer(res.data);
          toast.success('Customer saved');
        })
      }
      fields={(form) => <CustomerFields {...form} />}
      component={({ open: edit }) => (
        <MergeCustomer
          customer={customer}
          onMerged={onCustomer}
          component={({ open: merge }) => (
            <AlertModal
              title={`Delete ${customer.name}?`}
              description={customer.orderCount ? 'This customer has orders, so they can only be merged into another record, not deleted.' : 'Only for a record saved by mistake. This cannot be undone.'}
              confirmText="Delete"
              cancelText="Keep"
              onConfirm={remove}
              component={({ open: confirmDelete }) => {
                // Only what this person may do; with nothing allowed, no menu at all.
                const items = [
                  ...(can(workplace, 'customers:manage') ? [{ label: 'Edit customer', icon: Pencil, onClick: edit }] : []),
                  ...(can(workplace, 'customers:delete')
                    ? [
                        { label: 'Merge a duplicate', icon: Merge, onClick: merge },
                        { label: 'Delete', icon: Trash2, danger: true, onClick: confirmDelete },
                      ]
                    : []),
                ];
                return items.length > 0 && <DropdownMenu trigger={<IconButton icon={Ellipsis} variant="outline" aria-label={`More for ${customer.name}`} aria-haspopup="menu" />} items={items} />;
              }}
            />
          )}
        />
      )}
    />
  );
}
