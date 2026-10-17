import { useState } from "react";
import {
  Alert, Button, IconButton, Paper, Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography, InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import { useAsyncAction } from "../hooks/useFeedback";
import { createContact, deleteContact, updateContact } from "../services/contacts";
import { formatPhone } from "../lib/phone";
import type { ContactInput } from "../lib/validation";
import type { Contact } from "../types";
import { ContactFormDialog } from "./ContactFormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";

type Props = {
  clientId: string;
  connectionId: string;
  contacts: Contact[];
  loading: boolean;
  error: Error | null;
};

type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; contact: Contact }
  | { type: "delete"; contact: Contact };

const matches = (term: string) => (contact: Contact) => {
  const text = term.trim().toLowerCase();
  const digits = text.replace(/\D/g, "");
  return !text || contact.name.toLowerCase().includes(text) || (digits !== "" && contact.phone.includes(digits));
};

export const ContactsPanel = ({ clientId, connectionId, contacts, loading, error }: Props) => {
  const { pending, run } = useAsyncAction();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [search, setSearch] = useState("");
  const close = () => setDialog({ type: "closed" });
  const visible = contacts.filter(matches(search));

  const handleSave = async (input: ContactInput) => {
    const ok = dialog.type === "edit"
      ? await run(() => updateContact(dialog.contact.id, input), "Contato atualizado")
      : await run(() => createContact(clientId, connectionId, input), "Contato adicionado");
    if (ok) close();
  };

  const handleDelete = async () => {
    if (dialog.type !== "delete") return;
    if (await run(() => deleteContact(dialog.contact.id), "Contato excluído")) close();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextField
          placeholder="Buscar por nome ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ type: "create" })}>
          Novo contato
        </Button>
      </div>

      {error && <Alert severity="error">Erro ao carregar contatos.</Alert>}

      {loading ? (
        <Skeleton variant="rounded" height={160} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon />}
          title="Nenhum contato nesta conexão"
          description="Adicione contatos para poder enviar mensagens."
        />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell align="right" width={110}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell className="font-mono text-sm">{formatPhone(contact.phone)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => setDialog({ type: "edit", contact })}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDialog({ type: "delete", contact })}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Nenhum contato encontrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ContactFormDialog
        open={dialog.type === "create" || dialog.type === "edit"}
        initial={dialog.type === "edit" ? { name: dialog.contact.name, phone: dialog.contact.phone } : undefined}
        pending={pending}
        onSubmit={handleSave}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog.type === "delete"}
        title="Excluir contato?"
        description={`"${dialog.type === "delete" ? dialog.contact.name : ""}" será removido desta conexão e das mensagens em que aparece.`}
        pending={pending}
        onConfirm={handleDelete}
        onClose={close}
      />
    </div>
  );
};
