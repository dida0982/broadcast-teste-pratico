import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useClientId } from "../hooks/useAuth";
import { useConnection, useContacts } from "../hooks/useData";
import { ContactsPanel } from "../components/ContactsPanel";
import { BroadcastPanel } from "../components/BroadcastPanel";

type TabKey = "contacts" | "broadcast";

export const ConnectionDetailPage = () => {
  const { connectionId = "" } = useParams();
  const clientId = useClientId();
  const [tab, setTab] = useState<TabKey>("contacts");
  const connection = useConnection(connectionId);
  const contacts = useContacts(clientId, connectionId);

  if (connection.loading) {
    return <div className="flex justify-center py-16"><CircularProgress /></div>;
  }

  // Sem permissão (outro cliente) ou inexistente: as regras do Firestore negam a leitura.
  if (!connection.data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert severity="warning">Conexão não encontrada.</Alert>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>Voltar</Button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <Button component={RouterLink} to="/" size="small" startIcon={<ArrowBackIcon />} className="-ml-2 mb-1">
          Conexões
        </Button>
        <Typography variant="h5" fontWeight={700}>{connection.data.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {contacts.data.length} contato{contacts.data.length === 1 ? "" : "s"}
        </Typography>
      </div>

      <Tabs value={tab} onChange={(_, v: TabKey) => setTab(v)} className="border-b border-slate-200">
        <Tab value="contacts" icon={<PeopleIcon />} iconPosition="start" label="Contatos" />
        <Tab value="broadcast" icon={<CampaignIcon />} iconPosition="start" label="Broadcast" />
      </Tabs>

      {tab === "contacts" ? (
        <ContactsPanel
          clientId={clientId}
          connectionId={connectionId}
          contacts={contacts.data}
          loading={contacts.loading}
          error={contacts.error}
        />
      ) : (
        <BroadcastPanel clientId={clientId} connectionId={connectionId} contacts={contacts.data} />
      )}
    </section>
  );
};
