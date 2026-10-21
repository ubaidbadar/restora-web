import useAuthStore from '../../store/auth_store';
import SettingsForm from './settings_form';

interface SettingsSectionProps {
  section: 'restaurant' | 'tax';
}

/**
 * The restaurant's settings for the Restaurant and Tax tabs, straight from /me (no request); the name and logo come from
 * `workplace.restaurant`.
 * Saving puts the saved settings in the store, which every screen then shows; the form starts again from them.
 */
export default function SettingsSection({ section }: SettingsSectionProps) {
  const { settings, restaurant } = useAuthStore((state) => state.me!.workplace!);
  return <SettingsForm key={settings.updatedAt} settings={{ ...settings, restaurantName: restaurant.name, logo: restaurant.logo }} section={section} onSaved={useAuthStore.getState().setSettings} />;
}
