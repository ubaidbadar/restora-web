
interface Position {
  top: number;
  left: number;
}

interface Size {
  width: number;
  height: number;
}

/** Returns viewport coordinates for the floating element, or null to leave it hidden. */
type Placement = (anchor: DOMRect, floating: Size) => Position | null;

export default Placement;
