import ALL_CATEGORIES from '../constants/all_categories';
import type MenuCategory from '../types/menu_category';
import Chips from '../ui/chips';

interface CategoryChipsProps {
  categories: MenuCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  counts?: Record<string, number>;
  wrapOnDesktop?: boolean;
}

export default function CategoryChips({ categories, value, onChange, counts, wrapOnDesktop = false }: CategoryChipsProps) {
  const options = [
    { value: ALL_CATEGORIES, label: 'All', count: counts?.[ALL_CATEGORIES] || undefined },
    ...categories.map((category) => ({
      value: category._id,
      label: category.name,
      count: counts?.[category._id] || undefined,
    })),
  ];
  return <Chips name="category" label="Category" options={options} value={value} onChange={onChange} wrapOnDesktop={wrapOnDesktop} />;
}
