import { Plus } from 'lucide-react';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import SkeletonList from '../../../components/skeleton_list';
import api from '../../../config/api';
import useGet from '../../../hooks/useGet';
import type MenuCategory from '../../../types/menu_category';
import type PrintAgent from '../../../types/print_agent';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import toast from '../../../utils/toast';
import AgentRow from './agent_row';
import agentSchema from './agent_schema';

/** The branch's print agents with their printers. Adding a PC gives the pairing code to type into the agent. */
export default function AgentsCard({ categories }: { categories: MenuCategory[] }) {
  const { data: agents = [], loading, get, update } = useGet<PrintAgent[]>('/print-agents');
  const replace = (saved: PrintAgent) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)));

  return (
    <SectionCard
      title="PCs and printers"
      description="Name each printer and say what it prints. Kitchen slips can go to one printer per category."
      flush
      action={
        <FormDrawer
          title="Add a PC"
          schema={agentSchema}
          defaultValues={{ name: 'Counter PC' }}
          submitLabel="Get pairing code"
          onSave={(values) =>
            api.post('/print-agents', values).then((res) => {
              update((current) => [...(current ?? []), res.data]);
              toast.success('Type the pairing code into the agent');
            })
          }
          fields={({ register, errors }) => <Input label="PC name" dir="auto" required autoFocus placeholder="e.g. Counter PC" {...register('name')} error={fieldError(errors, 'name')} />}
          component={({ open }) => (
            <Button icon={Plus} onClick={open}>
              Add a PC
            </Button>
          )}
        />
      }
    >
      {loading && <SkeletonList rows={2} variant="lines" />}
      {!loading && !agents.length && <p className="px-5 py-4 text-sm text-muted sm:px-6">No PC added yet.</p>}
      <ul className="divide-y divide-border">
        {agents.map((agent) => (
          <AgentRow
            key={agent._id}
            agent={agent}
            categories={categories}
            onSaved={replace}
            onRemoved={(id) => update((current) => current?.filter((item) => item._id !== id))}
            onRefresh={() => get()}
          />
        ))}
      </ul>
    </SectionCard>
  );
}
