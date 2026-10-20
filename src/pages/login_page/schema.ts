import { z } from 'zod';
import emailField from '../../utils/email_field';
import requiredText from '../../utils/required_text';

const loginSchema = z.object({ email: emailField, password: requiredText('Enter your password') });

export default loginSchema;
