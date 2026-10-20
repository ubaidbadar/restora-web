import type OverlayTrigger from './overlay_trigger';
import type ShowTools from './show_tools';

type OverlayControllerProps<Props extends ShowTools> = Omit<Props, keyof ShowTools> & {
  component?: OverlayTrigger;
};

export default OverlayControllerProps;
