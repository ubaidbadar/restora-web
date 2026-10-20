import type { ReactNode } from 'react';

/** Footer content, or a function of `close` (e.g. `footer={(close) => <Button onClick={close} />}`). */
type OverlayFooter = ReactNode | ((close: () => void) => ReactNode);

export default OverlayFooter;
