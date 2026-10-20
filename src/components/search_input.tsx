import { Search } from 'lucide-react';
import { useRef } from 'react';
import Input from '../ui/input';

interface SearchInputProps {
  /** The value to start with, usually from the URL. The box keeps its own text while typing. */
  initialValue: string;
  onSearch: (value: string) => void;
  label: string;
  placeholder?: string;
  delay?: number;
}

/** Search box that reports after the user pauses typing. Pressing "/" anywhere focuses it. */
export default function SearchInput({ initialValue, onSearch, label, placeholder, delay = 200 }: SearchInputProps) {
  const timer = useRef<number | undefined>(undefined);

  return (
    <Input
      type="search"
      data-search
      icon={Search}
      aria-label={label}
      placeholder={placeholder ?? label}
      defaultValue={initialValue}
      className="bg-surface"
      onChange={(event) => {
        const { value } = event.target;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => onSearch(value.trim()), delay);
      }}
    />
  );
}
