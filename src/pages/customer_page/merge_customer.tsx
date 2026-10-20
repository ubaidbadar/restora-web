import withOverlay from '../../hoc/withOverlay';
import MergePanel from './merge_panel';

/** `<MergeCustomer customer onMerged component={({ open }) => …} />` */
const MergeCustomer = withOverlay(MergePanel);

export default MergeCustomer;
