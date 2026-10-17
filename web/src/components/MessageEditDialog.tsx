import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { MessageForm } from "./MessageForm";
import type { MessageInput } from "../lib/validation";
import type { Contact, Message } from "../types";

type Props = {
  message: Message | null;
  contacts: Contact[];
  pending?: boolean;
  onSubmit: (message: Message, input: MessageInput) => Promise<boolean>;
  onClose: () => void;
};

const toInput = (message: Message): MessageInput => ({
  body: message.body,
  contactIds: message.contactIds,
  mode: message.status === "scheduled" ? "schedule" : "now",
  scheduledAt: message.scheduledAt,
});

export const MessageEditDialog = ({ message, contacts, pending, onSubmit, onClose }: Props) => (
  <Dialog open={message !== null} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Editar mensagem</DialogTitle>
    <DialogContent className="!pt-2">
      {message && (
        <MessageForm
          key={message.id}
          contacts={contacts}
          initial={toInput(message)}
          pending={pending}
          // Mensagens já enviadas não podem ser reagendadas.
          allowScheduling={message.status === "scheduled"}
          submitLabel="Salvar"
          onSubmit={(input) => onSubmit(message, input)}
          onCancel={onClose}
        />
      )}
    </DialogContent>
  </Dialog>
);
