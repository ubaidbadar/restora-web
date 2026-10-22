import { z } from 'zod';
import codeField from '../../constants/code_field';
import newPasswordField from '../../constants/new_password_field';

const codeSchema = z.object({ code: codeField, password: newPasswordField });

export default codeSchema;
