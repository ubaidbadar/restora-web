import withOverlay from '../../hoc/withOverlay';
import Modal from '.';

/** `<ModalOverlay title="…" component={({ open }) => <Button onClick={open}>…</Button>}>…</ModalOverlay>` */
export default withOverlay(Modal);
