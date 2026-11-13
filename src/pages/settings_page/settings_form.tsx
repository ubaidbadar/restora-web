import api from '../../config/api';
import SectionCard from '../../components/section_card';
import settingsSchema from '../../constants/settings_schema';
import type Settings from '../../types/settings';
import Form from '../../ui/form';
import TaxFields from '../../components/tax_fields';
import toast from '../../utils/toast';
import RestaurantFields from './restaurant_fields';
import SaveBar from './save_bar';
import ServiceChargeFields from './service_charge_fields';

type SettingsSection = 'restaurant' | 'tax';

const SECTIONS: Record<SettingsSection, { title: string; description: string }> = {
  restaurant: { title: 'Restaurant details', description: 'Your logo and name, as customers see them on receipts.' },
  tax: { title: 'Tax & dine-in service charge', description: 'Set tax by payment method and an optional service charge for dine-in orders. Check tax treatment with your accountant.' },
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
      defaultValues={{ ...settings, dineInServiceCharge: { enabled: false, type: 'percentage', value: 0, taxable: true, ...settings.dineInServiceCharge }, receipt: { ntn: '', strn: '', footer: '', ...settings.receipt } }}
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
          {section === 'tax' && <div className="flex flex-col gap-6"><TaxFields register={props.register} errors={props.errors} /><ServiceChargeFields {...props} /></div>}
        </SectionCard>
      )}
    />
  );
}
