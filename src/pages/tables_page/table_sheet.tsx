import withOverlay from '../../hoc/withOverlay';
import TableSheetPanel from './table_sheet_panel';

/** `<TableSheet table onAnswer component={({ open }) => …} />` */
const TableSheet = withOverlay(TableSheetPanel);

export default TableSheet;
