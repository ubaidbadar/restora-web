import { z } from 'zod';
import mobileField from '../../utils/mobile_field';
import optionalText from '../../utils/optional_text';
import requiredText from '../../utils/required_text';

/** A new booking. A guest whose number is not saved yet becomes a customer. */
const reservationSchema = z.object({
  phone: mobileField,
  name: requiredText('Enter the guest name'),
  partySize: z.coerce.number('Enter how many people').int('Enter a whole number').min(1, 'At least 1 person'),
  date: requiredText('Pick a date'),
  time: requiredText('Pick a time'),
  note: optionalText,
  /** '' = no table. */
  tableId: z.string().default(''),
});

export default reservationSchema;
