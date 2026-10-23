import api from '../../config/api';
import SectionCard from '../../components/section_card';
import settingsSchema from '../../constants/settings_schema';
import type Settings from '../../types/settings';
import Form from '../../ui/form';
import TaxFields from '../../components/tax_fields';
import toast from '../../utils/toast';
import RestaurantFields from './restaurant_fields';
import SaveBar from './save_bar';

type SettingsSection = 'restaurant' | 'tax';

const SECTIONS: Record<SettingsSection, { title: string; description: string }> = {
  restaurant: { title: 'Restaurant details', description: 'Your logo and name, as customers see them on receipts.' },
  tax: { title: 'Tax by payment method', description: 'The percentage added to an order, picked by how the customer pays. Check these with your accountant.' },
};

interface SettingsFormProps {
  settings: Settings;
  /** Which part of the settings this tab shows. */
  section: SettingsSection;
  /** Receives the saved settings. */
  onSaved: (settings: Settings) => void;
}

export default function SettingsForm({ settings, section, onSaved }: SettingsFormProps) {
  return (
    <Form
      schema={settingsSchema}
      // Every field the form shows has a starting value, so a section that nobody touched is not "unsaved"
      // (a receipt line that was never set would otherwise start as undefined and read back as '').
      defaultValues={{ ...settings, receipt: { ntn: '', strn: '', footer: '', ...settings.receipt } }}
      noValidate
      onSubmit={({ data, onSuccess, onError }) => {
        api
          .patch('/settings', data)
          .then((res) => {
            onSuccess('');
            toast.success('Settings saved');
            onSaved(res.data);
          })
          .catch(onError);
      }}
      component={(props) => (
        <SectionCard {...SECTIONS[section]} footer={<SaveBar control={props.control} loading={props.loading} />}>
          {section === 'restaurant' && <RestaurantFields {...props} />}
          {section === 'tax' && <TaxFields register={props.register} errors={props.errors} />}
        </SectionCard>
      )}
    />
  );
}
