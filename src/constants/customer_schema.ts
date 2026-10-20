import { z } from 'zod';
import altPhoneField from '../utils/alt_phone_field';
import mobileField from '../utils/mobile_field';
import optionalText from '../utils/optional_text';
import requiredText from '../utils/required_text';

/** "regular, corporate" becomes ['regular', 'corporate']. */
const listField = (separator: RegExp) =>
  z
    .string()
    .optional()
    .transform((value) => (value ?? '').split(separator).map((part) => part.trim()).filter(Boolean));

/** Adding and editing a customer. Phone numbers are saved normalized, tags and addresses as lists. */
const customerSchema = z.object({
  name: requiredText('Enter the customer name'),
  phone: mobileField,
  altPhone: altPhoneField,
  area: optionalText,
  tags: listField(/,/),
  addresses: listField(/\n/),
  notes: optionalText,
});

export default customerSchema;
