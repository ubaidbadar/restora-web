import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const profileSchema = z.object({ name: requiredText('Enter your name').pipe(z.string().max(80)) });

export default profileSchema;
