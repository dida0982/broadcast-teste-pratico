import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Button, Card, CardActionArea, CardContent, IconButton, Skeleton, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HubIcon from "@mui/icons-material/Hub";
import { useClientId } from "../hooks/useAuth";
import { useConnections } from "../hooks/useData";
import { useAsyncAction } from "../hooks/useFeedback";
import { createConnection, deleteConnection, updateConnection } from "../services/connections";
import { formatDateTime } from "../lib/date";
import { ConnectionFormDialog } from "../components/ConnectionFormDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import type { Connection } from "../types";

type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; connection: Connection }
  | { type: "delete"; connection: Connection };

export const ConnectionsPage = () => {
  const clientId = useClientId();
  const navigate = useNavigate();
  const { data: connections, loading, error } = useConnections(clientId);
  const { pending, run } = useAsyncAction();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const close = () => setDialog({ type: "closed" });

  const handleSave = async ({ name }: { name: string }) => {
    const ok = dialog.type === "edit"
      ? await run(() => updateConnection(dialog.connection.id, name), "Conexão atualizada")
      : await run(() => createConnection(clientId, name), "Conexão criada");
    if (ok) close();
  };

  const handleDelete = async () => {
    if (dialog.type !== "delete") return;
    if (await run(() => deleteConnection(dialog.connection.id), "Conexão excluída")) close();
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" fontWeight={700}>Conexões</Typography>
          <Typography variant="body2" color="text.secondary">
            Cada conexão tem seus próprios contatos e mensagens.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ type: "create" })}>
          Nova conexão
        </Button>
      </header>

      {error && <Alert severity="error">Erro ao carregar conexões.</Alert>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={96} />)}
        </div>
      ) : connections.length === 0 ? (
        <EmptyState
          icon={<HubIcon />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
          action={<Button startIcon={<AddIcon />} onClick={() => setDialog({ type: "create" })}>Criar conexão</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="relative transition-shadow hover:shadow-md">
              <CardActionArea onClick={() => navigate(`/connections/${connection.id}`)}>
                <CardContent className="pr-24">
                  <Typography variant="subtitle1" fontWeight={600} noWrap>{connection.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Criada em {formatDateTime(connection.createdAt)}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => setDialog({ type: "edit", connection })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton size="small" color="error" onClick={() => setDialog({ type: "delete", connection })}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConnectionFormDialog
        open={dialog.type === "create" || dialog.type === "edit"}
        initial={dialog.type === "edit" ? { name: dialog.connection.name } : undefined}
        pending={pending}
        onSubmit={handleSave}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog.type === "delete"}
        title="Excluir conexão?"
        description={`"${dialog.type === "delete" ? dialog.connection.name : ""}" e todos os seus contatos e mensagens serão removidos.`}
        pending={pending}
        onConfirm={handleDelete}
        onClose={close}
      />
    </section>
  );
};
