import { z } from 'zod';
import requiredText from '../../../utils/required_text';

const confirmNameSchema = z.object({ confirmName: requiredText('Type the restaurant name') });

export default confirmNameSchema;
