import { KeyRound } from 'lucide-react';
import api from '../../../config/api';
import type StaffMember from '../../../types/staff_member';
import DropdownMenu from '../../../ui/dropdown_menu';
import IconButton from '../../../ui/icon_button';
import toast from '../../../utils/toast';
import getAxiosMessage from '../../../utils/get_axios_message';

interface PinMenuProps {
  member: StaffMember;
  name: string;
  onSaved: (member: StaffMember) => void;
}

/** Help with someone's POS PIN: unlock it after too many wrong tries, or clear it so they set a new one. Never set it for them. */
export default function PinMenu({ member, name, onSaved }: PinMenuProps) {
  return (
    <DropdownMenu
      trigger={<IconButton icon={KeyRound} aria-label={`${name}'s POS PIN`} aria-haspopup="menu" />}
      items={[
        ...(member.pinLocked
          ? [
              {
                label: 'Unlock PIN',
                onClick: () =>
                  api
                    .post(`/members/${member._id}/unlock-pin`)
                    .then((res) => {
                      onSaved(res.data);
                      toast.success(`${name}'s PIN works again`);
                    }).catch((err) => toast.error(getAxiosMessage(err))),
              },
            ]
          : []),
        {
          label: 'Clear PIN',
          danger: true,
          onClick: () =>
            api
              .post(`/members/${member._id}/clear-pin`)
              .then((res) => {
                onSaved(res.data);
                toast.success(`${name}'s PIN cleared. They can set a new one.`);
              }).catch((err) => toast.error(getAxiosMessage(err))),
        },
      ]}
    />
  );
}
