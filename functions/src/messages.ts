import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db, updateAll } from "./firestore";
import { REGION } from "./config";

// Query das mensagens agendadas cujo horário já chegou.
const dueMessagesQuery = (now: Timestamp) =>
  db
    .collection("messages")
    .where("status", "==", "scheduled")
    .where("scheduledAt", "<=", now);

// Simula o disparo: marca as mensagens como enviadas.
// Roda no backend a cada minuto, independente do usuário estar com o app aberto.
export const dispatchScheduledMessages = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Sao_Paulo",
    region: REGION,
    retryCount: 0,
  },
  async () => {
    const sent = await updateAll(dueMessagesQuery(Timestamp.now()), {
      status: "sent",
      sentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (sent > 0) logger.info(`Mensagens agendadas enviadas: ${sent}`);
  },
);
