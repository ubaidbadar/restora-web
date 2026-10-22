import { z } from 'zod';
import codeField from '../../constants/code_field';

const verifyEmailSchema = z.object({ code: codeField });

export default verifyEmailSchema;
