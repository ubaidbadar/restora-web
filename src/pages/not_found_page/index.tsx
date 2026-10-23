import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import EmptyState from '../../components/empty_state';
import Button from '../../ui/button';

export default function NotFoundPage() {
  return (
    <EmptyState icon={Compass} titleAs="h1" title="Page not found" text="This link does not go anywhere. Head back to today's numbers.">
      <Button as={Link} to="/">Go to Home</Button>
    </EmptyState>
  );
}
