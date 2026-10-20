import SectionCard from '../../../components/section_card';
import DeleteRestaurant from './delete_restaurant';
import TransferOwnership from './transfer_ownership';

/** Only for the restaurant's owner: hand it to someone else, or delete it (recoverable for 30 days). */
export default function OwnerZone() {
  return (
    <SectionCard title="Owner" description="Only you, as the owner of the restaurant, see this. Both need a sign-in from the last 10 minutes.">
      <div className="flex flex-col gap-5">
        <TransferOwnership />
        <div className="border-t border-border pt-5">
          <DeleteRestaurant />
        </div>
      </div>
    </SectionCard>
  );
}
