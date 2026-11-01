import api from '../../../config/api';
import SectionCard from '../../../components/section_card';
import useAuthStore from '../../../store/auth_store';
import Form from '../../../ui/form';
import Tabs from '../../../ui/tabs';
import toast from '../../../utils/toast';
import SaveBar from '../save_bar';
import appearanceSchema from './schema';
import ThemeCards from './theme_cards';

const MODES = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'Follow device' },
];
const SIDEBARS = [
  { value: 'theme' as const, label: 'Theme colour' },
  { value: 'plain' as const, label: 'Plain' },
];

/**
 * Settings → Appearance: how Restora looks for everyone in the restaurant, on every device. Saving puts the settings in
 * the store, and the app repaints in them at once (utils/apply_appearance, from main.tsx).
 */
export default function AppearanceTab() {
  const settings = useAuthStore((state) => state.me!.workplace!.settings);
  const appearance = settings.appearance ?? { theme: 'indigo', mode: 'light', sidebar: 'plain' };
  return (
    <Form
      key={settings.updatedAt}
      schema={appearanceSchema}
      defaultValues={{ appearance }}
      noValidate
      onSubmit={({ data, onSuccess, onError }) => {
        api
          .patch('/settings', data)
          .then((res) => {
            onSuccess('');
            toast.success('Appearance saved for the whole team');
            useAuthStore.getState().setSettings(res.data);
          })
          .catch(onError);
      }}
      component={(props) => (
        <div className="flex flex-col gap-6">
          <SectionCard title="Theme" description="The colours of Restora for everyone in this restaurant. Each theme has a light and a dark side, both made to stay easy to read." wide>
            <ThemeCards value={appearance.theme} register={props.register} />
          </SectionCard>
          <SectionCard title="Light or dark" description="For the whole team. Follow device uses each phone's or computer's own setting." footer={<SaveBar control={props.control} loading={props.loading} />} wide>
            <div className="flex flex-col gap-6">
              <Tabs name="appearance.mode" label="Light or dark" options={MODES} value={appearance.mode} register={props.register} />
              <div>
                <Tabs name="appearance.sidebar" label="Sidebar on computers" options={SIDEBARS} value={appearance.sidebar} register={props.register} showLabel />
                <p className="mt-2 text-sm text-muted">In the theme's deep colour, or plain like the page.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    />
  );
}
