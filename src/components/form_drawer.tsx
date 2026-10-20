import withOverlay from '../hoc/withOverlay';
import FormDrawerPanel from './form_drawer_panel';

/** `<FormDrawer component={({ open }) => <Button onClick={open}>Add</Button>} ... />` */
const FormDrawer = withOverlay(FormDrawerPanel);

export default FormDrawer;
