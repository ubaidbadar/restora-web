import DevicesCard from './devices_card';
import RegisterDeviceCard from './register_device_card';

/** This browser as a POS terminal, and the restaurant's registered terminals. */
export default function DevicesTab() {
  return (
    <div className="flex flex-col gap-6">
      <RegisterDeviceCard />
      <DevicesCard />
    </div>
  );
}
