import { useMemo, useState } from "react";
import { Alert, Paper, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import { useAsyncAction } from "../hooks/useFeedback";
import { useMessages } from "../hooks/useData";
import { countByStatus, createMessage, deleteMessage, filterMessages, updateMessage } from "../services/messages";
import { addMinutes } from "../lib/date";
import type { MessageInput } from "../lib/validation";
import type { Contact, Message, MessageFilter } from "../types";
import { MessageForm } from "./MessageForm";
import { MessageList } from "./MessageList";
import { MessageEditDialog } from "./MessageEditDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";

type Props = { clientId: string; connectionId: string; contacts: Contact[] };

const newMessage = (): MessageInput => ({
  body: "",
  contactIds: [],
  mode: "now",
  scheduledAt: addMinutes(new Date(), 5),
});

const filterLabels: Record<MessageFilter, string> = {
  all: "Todas",
  sent: "Enviadas",
  scheduled: "Agendadas",
};

export const BroadcastPanel = ({ clientId, connectionId, contacts }: Props) => {
  const { data: messages, loading, error } = useMessages(clientId, connectionId);
  const { pending, run } = useAsyncAction();
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [editing, setEditing] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);

  const contactsById = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
  const counts = countByStatus(messages);
  const visible = filterMessages(messages, filter);

  const handleCreate = (input: MessageInput) =>
    run(
      () => createMessage(clientId, connectionId, input),
      input.mode === "now" ? "Mensagem enviada" : "Mensagem agendada",
    );

  const handleUpdate = async (message: Message, input: MessageInput) => {
    const ok = await run(() => updateMessage(message, input), "Mensagem atualizada");
    if (ok) setEditing(null);
    return ok;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    if (await run(() => deleteMessage(deleting.id), "Mensagem excluída")) setDeleting(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Paper className="h-fit p-5">
        <Typography variant="subtitle1" fontWeight={600} className="mb-4">Nova mensagem</Typography>
        {contacts.length === 0 ? (
          <Alert severity="info">Cadastre contatos na aba Contatos para enviar mensagens.</Alert>
        ) : (
          <MessageForm contacts={contacts} initial={newMessage()} pending={pending} onSubmit={handleCreate} resetOnSuccess />
        )}
        <Typography variant="caption" color="text.secondary" className="mt-4 block">
          O envio é simulado. Mensagens agendadas são marcadas como enviadas pelo servidor no horário definido.
        </Typography>
      </Paper>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography variant="subtitle1" fontWeight={600}>Mensagens</Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filter}
            onChange={(_, value: MessageFilter | null) => value && setFilter(value)}
          >
            {(Object.keys(filterLabels) as MessageFilter[]).map((key) => (
              <ToggleButton key={key} value={key}>
                {filterLabels[key]} ({counts[key]})
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {error && <Alert severity="error">Erro ao carregar mensagens.</Alert>}

        {loading ? (
          <Skeleton variant="rounded" height={120} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<ForumIcon />}
            title={filter === "all" ? "Nenhuma mensagem ainda" : `Nenhuma mensagem ${filterLabels[filter].toLowerCase().slice(0, -1)}`}
          />
        ) : (
          <MessageList messages={visible} contactsById={contactsById} onEdit={setEditing} onDelete={setDeleting} />
        )}
      </section>

      <MessageEditDialog
        message={editing}
        contacts={contacts}
        pending={pending}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir mensagem?"
        description="Esta ação não pode ser desfeita."
        pending={pending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
};
