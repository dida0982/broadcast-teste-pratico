import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toDate } from "../lib/date";
import type { MessageInput } from "../lib/validation";
import type { Message, MessageFilter } from "../types";

const messagesCol = collection(db, "messages");

export const messagesQuery = (clientId: string, connectionId: string) =>
  query(
    messagesCol,
    where("clientId", "==", clientId),
    where("connectionId", "==", connectionId),
    orderBy("createdAt", "desc"),
  );

export const toMessage = (snap: DocumentSnapshot): Message => {
  const data = snap.data({ serverTimestamps: "estimate" }) ?? {};
  return {
    id: snap.id,
    clientId: data.clientId,
    connectionId: data.connectionId,
    contactIds: data.contactIds ?? [],
    body: data.body,
    status: data.status,
    scheduledAt: toDate(data.scheduledAt),
    sentAt: toDate(data.sentAt),
    createdAt: toDate(data.createdAt),
  };
};

export const filterMessages = (messages: Message[], filter: MessageFilter): Message[] =>
  filter === "all" ? messages : messages.filter((m) => m.status === filter);

export const countByStatus = (messages: Message[]): Record<MessageFilter, number> => ({
  all: messages.length,
  sent: messages.filter((m) => m.status === "sent").length,
  scheduled: messages.filter((m) => m.status === "scheduled").length,
});

// Envio imediato é simulado: a mensagem já nasce como "sent".
// Agendada nasce como "scheduled" e a Cloud Function dispatchScheduledMessages
// muda o status quando o horário chega.
const deliveryFields = ({ mode, scheduledAt }: MessageInput) =>
  mode === "now" || !scheduledAt
    ? { status: "sent", sentAt: serverTimestamp() }
    : { status: "scheduled", scheduledAt: Timestamp.fromDate(scheduledAt), sentAt: null };

export const createMessage = (clientId: string, connectionId: string, input: MessageInput) =>
  addDoc(messagesCol, {
    clientId,
    connectionId,
    body: input.body.trim(),
    contactIds: input.contactIds,
    scheduledAt: null,
    ...deliveryFields(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

// Mensagens enviadas só têm texto e destinatários editáveis;
// agendadas podem ser reagendadas ou enviadas na hora.
export const updateMessage = (message: Message, input: MessageInput) =>
  updateDoc(doc(db, "messages", message.id), {
    body: input.body.trim(),
    contactIds: input.contactIds,
    ...(message.status === "scheduled" ? deliveryFields(input) : {}),
    updatedAt: serverTimestamp(),
  });

export const deleteMessage = (id: string) => deleteDoc(doc(db, "messages", id));
