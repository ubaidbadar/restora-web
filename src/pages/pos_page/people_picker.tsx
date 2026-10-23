import { useState } from 'react';
import type PosPerson from '../../types/pos_person';
import Avatar from '../../ui/avatar';
import Button from '../../ui/button';
import initialsOf from '../../utils/initials_of';
import PinForm from './pin_form';

interface PeoplePickerProps {
  people: PosPerson[];
}

/** Tap your name, then type your PIN. */
export default function PeoplePicker({ people }: PeoplePickerProps) {
  const [picked, setPicked] = useState<PosPerson | null>(null);

  if (picked) {
    return (
      <div className="flex flex-col gap-4">
        <PinForm key={picked.membershipId} person={picked} />
        <Button variant="ghost" onClick={() => setPicked(null)}>Someone else</Button>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="People who can unlock this terminal">
      {people.map((person) => (
        <li key={person.membershipId}>
          <button
            type="button"
            disabled={person.locked || !person.hasPin}
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-card border border-border p-4 text-center transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPicked(person)}
          >
            <Avatar initials={initialsOf(person.name)} alt="" size="lg" />
            <span className="w-full text-sm font-semibold break-words text-ink"><bdi>{person.name}</bdi></span>
            <span className="w-full truncate text-xs text-muted">{person.locked ? 'PIN locked' : person.hasPin ? person.roleNames.join(', ') : 'No PIN yet'}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
