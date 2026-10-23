import withOverlay from '../../hoc/withOverlay';
import CancelOrderPanel from './cancel_order_panel';

/** `<CancelOrder order onCancel component={({ open }) => …} />` */
const CancelOrder = withOverlay(CancelOrderPanel);

export default CancelOrder;
