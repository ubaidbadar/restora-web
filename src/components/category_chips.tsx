import ALL_CATEGORIES from '../constants/all_categories';
import type MenuCategory from '../types/menu_category';
import Chips from '../ui/chips';

interface CategoryChipsProps {
  categories: MenuCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  scrollControls?: boolean;
}

export default function CategoryChips({ categories, value, onChange, scrollControls = false }: CategoryChipsProps) {
  const options = [{ value: ALL_CATEGORIES, label: 'All' }, ...categories.map((category) => ({ value: category._id, label: category.name }))];
  return <Chips name="category" label="Category" options={options} value={value} onChange={onChange} scrollControls={scrollControls} />;
}
