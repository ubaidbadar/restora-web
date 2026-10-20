import useAuthStore from '../../store/auth_store';
import useRestaurantSettings from '../../hooks/useRestaurantSettings';
import SettingsForm from './settings_form';

interface SettingsSectionProps {
  section: 'restaurant' | 'tax';
}

/**
 * The restaurant's settings for the Restaurant and Tax tabs, straight from /me (no request).
 * Saving puts the saved settings in the store, which every screen then shows; the form starts again from them.
 */
export default function SettingsSection({ section }: SettingsSectionProps) {
  const settings = useRestaurantSettings();
  return <SettingsForm key={settings.updatedAt} settings={settings} section={section} onSaved={useAuthStore.getState().setSettings} />;
}
