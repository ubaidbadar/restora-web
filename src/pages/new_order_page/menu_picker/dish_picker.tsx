import withOverlay from '../../../hoc/withOverlay';
import DishPickerPanel from './dish_picker_panel';

/** `<DishPicker dish groups onAdd component={({ open }) => …} />` */
const DishPicker = withOverlay(DishPickerPanel);

export default DishPicker;
