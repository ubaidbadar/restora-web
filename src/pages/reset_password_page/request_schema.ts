import { z } from 'zod';
import emailField from '../../utils/email_field';

const requestSchema = z.object({ email: emailField });

export default requestSchema;
