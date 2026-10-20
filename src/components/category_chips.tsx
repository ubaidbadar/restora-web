import ALL_CATEGORIES from '../constants/all_categories';
import type MenuCategory from '../types/menu_category';
import ChoiceChips from './choice_chips';

interface CategoryChipsProps {
  categories: MenuCategory[];
  value: string;
  onChange: (categoryId: string) => void;
}

export default function CategoryChips({ categories, value, onChange }: CategoryChipsProps) {
  const options = [{ value: ALL_CATEGORIES, label: 'All' }, ...categories.map((category) => ({ value: category._id, label: category.name }))];
  return <ChoiceChips label="Category" options={options} value={value} onChange={onChange} />;
}
