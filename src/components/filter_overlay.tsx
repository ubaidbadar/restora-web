import withOverlay from '../hoc/withOverlay';
import FilterPanel from './filter_panel';

/** `<FilterOverlay anchorId={id} component={({ open }) => <IconButton id={id} onClick={open} … />} … />` */
const FilterOverlay = withOverlay(FilterPanel);

export default FilterOverlay;
