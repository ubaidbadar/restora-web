import OwnerZone from './owner/owner_zone';
import SettingsSection from './settings_section';
import useWorkplace from '../../hooks/useWorkplace';

/** Restaurant details, and (for the owner of the restaurant only) transfer and delete below. */
export default function RestaurantTab() {
  const isPrimaryOwner = useWorkplace()?.isPrimaryOwner;
  return (
    <div className="flex flex-col gap-6">
      <SettingsSection section="restaurant" />
      {isPrimaryOwner && <OwnerZone />}
    </div>
  );
}
