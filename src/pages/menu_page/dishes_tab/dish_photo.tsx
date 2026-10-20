import withOverlay from '../../../hoc/withOverlay';
import DishPhotoPanel from './dish_photo_panel';

/** `<DishPhoto dish onSaved component={({ open }) => …} />` */
const DishPhoto = withOverlay(DishPhotoPanel);

export default DishPhoto;
