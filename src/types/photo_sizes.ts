/** The smaller sizes of a saved photo: 160px (sm) and 480px (md) WebP, the large photo's size and a blurred preview. */
export default interface PhotoSizes {
  sm: string;
  md: string;
  width: number;
  height: number;
  blur: string;
}
