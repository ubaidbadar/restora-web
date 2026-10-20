import settingsSchema from '../../constants/settings_schema';

const taxStepSchema = settingsSchema.pick({ taxByPaymentMethod: true });

export default taxStepSchema;
