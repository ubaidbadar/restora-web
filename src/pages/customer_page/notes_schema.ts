import { z } from 'zod';
import optionalText from '../../utils/optional_text';

const notesSchema = z.object({ notes: optionalText });

export default notesSchema;
