export default interface OrderAlertState {
  /** Ids of new orders announced on this device that nobody has opened or moved on yet. */
  fresh: string[];
  /** This browser does not chime for new orders and guests' calls. */
  muted: boolean;
  add: (id: string) => void;
  seen: (id: string) => void;
  setMuted: (muted: boolean) => void;
}
