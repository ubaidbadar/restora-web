import api from '../../config/api';
import SAMPLE_MENU from '../../constants/sample_menu';
import Button from '../../ui/button';
import toast from '../../utils/toast';
import MenuChoice from './menu_choice';

interface StepMenuProps {
  onBack: () => void;
  onFinish: () => void;
}

const CATEGORIES = [...new Set(SAMPLE_MENU.items.map((dish) => dish.category))];

/** Setup step 3: start with the sample dishes or an empty menu, then open the app. */
export default function StepMenu({ onBack, onFinish }: StepMenuProps) {
  const handleFinish = (withSamples: boolean) => {
    const action = withSamples ? api.post('/menu/bulk', SAMPLE_MENU) : Promise.resolve();
    action
      .then(() => onFinish())
      .catch((err) => toast.error(err.response?.data?.message || 'Could not add the sample dishes. Try again.'));
  };

  return (
    <>
      <div className="grid gap-3 px-5 py-6 sm:grid-cols-2 sm:px-7">
        <MenuChoice
          title={`${SAMPLE_MENU.items.length} sample dishes`}
          description="With half/full sizes, extras and spice levels, so you can try an order straight away. Edit or delete them on the Menu page."
          tags={CATEGORIES}
          recommended
          onClick={() => handleFinish(true)}
        />
        <MenuChoice
          title="An empty menu"
          description="Add your own dishes one by one from the Menu page."
          onClick={() => handleFinish(false)}
        />
      </div>
      <footer className="flex items-center rounded-b-card border-t border-border bg-sunken/50 px-5 py-4 sm:px-7">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
      </footer>
    </>
  );
}
