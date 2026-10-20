/** `GET /public/t/:code`: what a guest sees after scanning a table's QR code. */
export default interface PublicMenu {
  restaurant: { name: string; logo?: string };
  branch: { name: string };
  table: { name: string };
  categories: { _id: string; name: string }[];
  addonGroups: { _id: string; name: string; min: number; max: number; options: { name: string; price: number }[] }[];
  items: {
    _id: string;
    categoryId: string;
    name: string;
    description?: string;
    photo?: string;
    sizes: { name: string; price: number }[];
    addonGroupIds: string[];
    soldOut: boolean;
  }[];
}
