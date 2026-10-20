import SectionCard from '../../../components/section_card';
import useGet from '../../../hooks/useGet';
import type Device from '../../../types/device';
import DeviceRow from './device_row';
import SkeletonList from '../../../components/skeleton_list';

/** The registered terminals of the branches you manage. Removing one stops it at once. */
export default function DevicesCard() {
  const { data: devices = [], loading, update } = useGet<Device[]>('/devices');
  return (
    <SectionCard title="POS terminals" description="Shared counters and tablets. Staff unlock them with their own PIN." flush>
      {loading && <SkeletonList rows={2} variant="lines" />}
      {!loading && !devices.length && <p className="px-5 py-4 text-sm text-muted sm:px-6">No terminals yet.</p>}
      <ul className="divide-y divide-border">
        {devices.map((device) => (
          <DeviceRow
            key={device._id}
            device={device}
            onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))}
            onRemoved={(id) => update((current) => current?.filter((item) => item._id !== id))}
          />
        ))}
      </ul>
    </SectionCard>
  );
}
