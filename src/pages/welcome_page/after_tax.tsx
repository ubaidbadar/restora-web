import { useState } from 'react';
import { useNavigate } from 'react-router';
import type Workplace from '@shared/workplace';
import SetupShell from '../../components/setup_shell';
import StepMenu from './step_menu';
import StepTax from './step_tax';

interface AfterTaxProps {
  settings: Workplace['settings'];
}

/** Step 3, the menu. "Back" opens the tax step again until it is saved once more. */
export default function AfterTax({ settings }: AfterTaxProps) {
  const navigate = useNavigate();
  const [editingTax, setEditingTax] = useState(false);

  if (editingTax) {
    return (
      <SetupShell step={2} title="Set your tax rates" description="The tax added to each order, picked by how the customer pays.">
        <StepTax settings={settings} onSaved={() => setEditingTax(false)} />
      </SetupShell>
    );
  }
  return (
    <SetupShell step={3} title="Start your menu" description="Begin with sample dishes to try an order right away, or add your own.">
      <StepMenu onBack={() => setEditingTax(true)} onFinish={() => navigate('/', { replace: true })} />
    </SetupShell>
  );
}
