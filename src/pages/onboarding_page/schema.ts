import { z } from 'zod';
import altPhoneField from '../../utils/alt_phone_field';
import optionalText from '../../utils/optional_text';
import requiredText from '../../utils/required_text';

const onboardingSchema = z.object({
  name: requiredText('Enter the restaurant name').pipe(z.string().max(80)),
  branchName: requiredText('Enter the branch name').pipe(z.string().max(60)),
  area: optionalText,
  city: optionalText,
  phone: altPhoneField,
  /** A data URL from the logo picker; the server uploads it. */
  logo: z.string().optional(),
});

export default onboardingSchema;
