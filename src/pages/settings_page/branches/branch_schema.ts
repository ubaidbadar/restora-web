import { z } from 'zod';
import altPhoneField from '../../../utils/alt_phone_field';
import optionalText from '../../../utils/optional_text';
import requiredText from '../../../utils/required_text';

const branchSchema = z.object({
  name: requiredText('Enter the branch name').pipe(z.string().max(60)),
  address: optionalText,
  area: optionalText,
  city: optionalText,
  phone: altPhoneField,
});

export default branchSchema;
