import { z } from 'zod';
import newPasswordField from '../../constants/new_password_field';
import emailField from '../../utils/email_field';
import requiredText from '../../utils/required_text';

const signupSchema = z.object({ name: requiredText('Enter your name'), email: emailField, password: newPasswordField });

export default signupSchema;
