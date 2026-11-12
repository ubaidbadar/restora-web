import { Download, Plus } from "lucide-react";
import FormDrawer from "../../../components/form_drawer";
import SectionCard from "../../../components/section_card";
import SkeletonList from "../../../components/skeleton_list";
import api from "../../../config/api";
import AGENT_DOWNLOAD_URL from "../../../constants/agent_download_url";
import useGet from "../../../hooks/useGet";
import type MenuCategory from "../../../types/menu_category";
import type PrintAgent from "../../../types/print_agent";
import Button from "../../../ui/button";
import Input from "../../../ui/input";
import fieldError from "../../../utils/field_error";
import toast from "../../../utils/toast";
import AgentRow from "./agent_row";
import agentSchema from "./agent_schema";
import SetupCard from "./setup_card";
import ThisPc from "./this_pc";

/**
 * The branch's print agents with their printers. Until one has paired, the setup steps stand in their place; after
 * that, adding another PC gives its pairing code in its row.
 */
export default function AgentsCard({
  categories,
}: {
  categories: MenuCategory[];
}) {
  const {
    data: agents = [],
    loading,
    get,
    update,
  } = useGet<PrintAgent[]>("/print-agents");
  const replace = (saved: PrintAgent) =>
    update((current) =>
      current?.map((item) => (item._id === saved._id ? saved : item)),
    );
  const add = (saved: PrintAgent) =>
    update((current) => [...(current ?? []), saved]);

  // Once the list is known: the agent on this PC, if it has not paired yet, pairs by itself.
  const thisPc = !loading && (
    <ThisPc onPaired={() => get()} />
  );

  if (!loading && !agents.some((agent) => agent.lastSeenAt)) {
    return (
      <div className="flex flex-col gap-4">
        {thisPc}
        <SetupCard
          agent={agents[0]}
          onAdded={add}
          onSaved={replace}
          onRefresh={() => get()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {thisPc}
      <SectionCard
        title="PCs and printers"
        description="Name each printer and say what it prints. Kitchen slips can go to one printer per category."
        flush
        action={
          <div className="flex gap-2">
            <Button
              as="a"
              href={AGENT_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              icon={Download}
            >
              Get the agent
            </Button>
            <FormDrawer
              title="Add a PC"
              schema={agentSchema}
              defaultValues={{ name: "Counter PC" }}
              submitLabel="Get connection code"
              onSave={(values) =>
                api.post("/print-agents", values).then((res) => {
                  add(res.data);
                  toast.success("Open Agent diagnostics and enter the connection code.");
                })
              }
              fields={({ register, errors }) => (
                <Input
                  label="PC name"
                  dir="auto"
                  required
                  autoFocus
                  placeholder="e.g. Counter PC"
                  {...register("name")}
                  error={fieldError(errors, "name")}
                />
              )}
              component={({ open }) => (
                <Button variant="outline" icon={Plus} onClick={open}>
                  Connect another PC manually
                </Button>
              )}
            />
          </div>
        }
      >
        {loading && <SkeletonList rows={2} variant="lines" />}
        <ul className="divide-y divide-border">
          {agents.map((agent) => (
            <AgentRow
              key={agent._id}
              agent={agent}
              categories={categories}
              onSaved={replace}
              onRemoved={(id) =>
                update((current) => current?.filter((item) => item._id !== id))
              }
              onRefresh={() => get()}
            />
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
