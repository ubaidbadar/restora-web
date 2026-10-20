import SetupShell from '../../components/setup_shell';
import AfterTax from './after_tax';
import StepTax from './step_tax';
import useRestaurantSettings from '../../hooks/useRestaurantSettings';

/** Setup steps 2 and 3, after the restaurant exists. The settings in /me decide the step: tax until it is saved, then the menu. */
export default function WelcomePage() {
  const settings = useRestaurantSettings();

  if (!settings.taxSet) {
    return (
      <SetupShell step={2} title="Set your tax rates" description="The tax added to each order, picked by how the customer pays.">
        <StepTax settings={settings} />
      </SetupShell>
    );
  }
  return <AfterTax settings={settings} />;
}
