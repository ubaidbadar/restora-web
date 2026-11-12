import { useState } from 'react';
import { useNavigate } from 'react-router';
import type Workplace from '@shared/workplace';
import SetupShell from '../../components/setup_shell';
import Button from '../../ui/button';
import StepMenu from './step_menu';
import StepTax from './step_tax';
import StepWhatsApp from './step_whatsapp';

interface AfterTaxProps {
  settings: Workplace['settings'];
}

/** Menu selection leads to optional WhatsApp setup; the restaurant can always skip it. */
export default function AfterTax({ settings }: AfterTaxProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'tax' | 'menu' | 'whatsapp' | 'connected' | 'pending'>('menu');

  if (step === 'tax') {
    return (
      <SetupShell step={2} title="Set your tax rates" description="The tax added to each order, picked by how the customer pays.">
        <StepTax settings={settings} onSaved={() => setStep('menu')} />
      </SetupShell>
    );
  }

  if (step === 'whatsapp') {
    return (
      <SetupShell step={4} title="Connect your WhatsApp"
        description="Get customer messages and send order updates from your restaurant's own WhatsApp Business number. This step is optional.">
        <StepWhatsApp onSkip={() => navigate('/', { replace: true })}
          onAuthorized={status => setStep(status === 'connected' ? 'connected' : 'pending')} />
      </SetupShell>
    );
  }

  if (step === 'connected' || step === 'pending') {
    return (
      <SetupShell step={4} title={step === 'connected' ? 'WhatsApp connected' : 'WhatsApp authorized'}
        description={step === 'connected'
          ? 'Your restaurant WhatsApp number is ready for customer messages.'
          : 'Your WhatsApp number has been saved, but Meta registration still needs to be completed.'}>
        <div className="flex flex-col gap-4 px-5 py-6 sm:px-7">
          <p className="text-sm text-body">
            {step === 'connected' ? 'Messages will appear in your WhatsApp inbox.'
              : 'Finish registering your number from Settings → WhatsApp connection after setup.'}
          </p>
        </div>
        <footer className="flex justify-end border-t border-border bg-sunken/50 px-5 py-4 sm:px-7">
          <Button onClick={() => navigate('/', { replace: true })}>Finish setup</Button>
        </footer>
      </SetupShell>
    );
  }

  return (
    <SetupShell step={3} title="Start your menu" description="Begin with sample dishes to try an order right away, or add your own.">
      <StepMenu onBack={() => setStep('tax')} onFinish={() => setStep('whatsapp')} />
    </SetupShell>
  );
}
