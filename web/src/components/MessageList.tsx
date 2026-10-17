import { Chip, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { formatDateTime } from "../lib/date";
import type { Contact, Message } from "../types";

type Props = {
  messages: Message[];
  contactsById: Map<string, Contact>;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
};

const StatusChip = ({ message }: { message: Message }) =>
  message.status === "sent" ? (
    <Chip size="small" color="success" icon={<DoneAllIcon />} label="Enviada" />
  ) : (
    <Chip size="small" color="warning" icon={<ScheduleIcon />} label="Agendada" />
  );

const timeLabel = (message: Message) =>
  message.status === "sent"
    ? `Enviada em ${formatDateTime(message.sentAt)}`
    : `Agendada para ${formatDateTime(message.scheduledAt)}`;

const recipientNames = (message: Message, contactsById: Map<string, Contact>) =>
  message.contactIds.map((id) => contactsById.get(id)?.name).filter(Boolean) as string[];

export const MessageList = ({ messages, contactsById, onEdit, onDelete }: Props) => (
  <ul className="m-0 flex list-none flex-col gap-3 p-0">
    {messages.map((message) => {
      const names = recipientNames(message, contactsById);
      return (
        <li key={message.id}>
          <Paper className="flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip message={message} />
              <Typography variant="caption" color="text.secondary">{timeLabel(message)}</Typography>
              <div className="flex-1" />
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(message)}><EditIcon fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Excluir">
                <IconButton size="small" color="error" onClick={() => onDelete(message)}><DeleteIcon fontSize="small" /></IconButton>
              </Tooltip>
            </div>
            <Typography variant="body2" className="whitespace-pre-wrap break-words">{message.body}</Typography>
            <Typography variant="caption" color="text.secondary">
              Para: {names.length ? names.join(", ") : "—"}
            </Typography>
          </Paper>
        </li>
      );
    })}
  </ul>
);
