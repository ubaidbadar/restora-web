import { z } from 'zod';
import newPasswordField from '../../constants/new_password_field';

const newPasswordSchema = z.object({ password: newPasswordField });

export default newPasswordSchema;
