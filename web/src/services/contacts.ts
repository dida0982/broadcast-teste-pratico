import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { normalizePhone } from "../lib/phone";
import type { ContactInput } from "../lib/validation";
import type { Contact } from "../types";

const contactsCol = collection(db, "contacts");

export const contactsQuery = (clientId: string, connectionId: string) =>
  query(
    contactsCol,
    where("clientId", "==", clientId),
    where("connectionId", "==", connectionId),
    orderBy("name"),
  );

export const toContact = (snap: DocumentSnapshot): Contact => {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    clientId: data.clientId,
    connectionId: data.connectionId,
    name: data.name,
    phone: data.phone,
  };
};

const sanitize = ({ name, phone }: ContactInput) => ({
  name: name.trim(),
  phone: normalizePhone(phone),
});

export const createContact = (clientId: string, connectionId: string, input: ContactInput) =>
  addDoc(contactsCol, {
    clientId,
    connectionId,
    ...sanitize(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateContact = (id: string, input: ContactInput) =>
  updateDoc(doc(db, "contacts", id), { ...sanitize(input), updatedAt: serverTimestamp() });

// A remoção do contato nas mensagens é feita pela Cloud Function onContactDeleted.
export const deleteContact = (id: string) => deleteDoc(doc(db, "contacts", id));
