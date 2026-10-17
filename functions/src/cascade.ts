import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FieldValue } from "firebase-admin/firestore";
import { db, deleteAll, updateAll } from "./firestore";
import { REGION } from "./config";

// Ao excluir uma conexão, remove seus contatos e mensagens
// (sem subcoleções, a exclusão em cascata precisa ser explícita).
export const onConnectionDeleted = onDocumentDeleted(
  { document: "connections/{connectionId}", region: REGION },
  async (event) => {
    const { connectionId } = event.params;
    const byConnection = (collection: string) =>
      db.collection(collection).where("connectionId", "==", connectionId);

    const [contacts, messages] = await Promise.all([
      deleteAll(byConnection("contacts")),
      deleteAll(byConnection("messages")),
    ]);
    logger.info(`Conexão ${connectionId} removida`, { contacts, messages });
  },
);

// Ao excluir um contato, retira-o dos destinatários das mensagens da conexão.
// Mensagens que ficarem sem destinatários são removidas.
export const onContactDeleted = onDocumentDeleted(
  { document: "contacts/{contactId}", region: REGION },
  async (event) => {
    const { contactId } = event.params;
    const connectionId = event.data?.get("connectionId") as string | undefined;
    if (!connectionId) return;

    const withContact = db
      .collection("messages")
      .where("connectionId", "==", connectionId)
      .where("contactIds", "array-contains", contactId);

    await updateAll(withContact, {
      contactIds: FieldValue.arrayRemove(contactId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await deleteAll(
      db
        .collection("messages")
        .where("connectionId", "==", connectionId)
        .where("contactIds", "==", []),
    );
  },
);
