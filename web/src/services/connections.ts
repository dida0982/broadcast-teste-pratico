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
import { toDate } from "../lib/date";
import type { Connection } from "../types";

const connectionsCol = collection(db, "connections");

export const connectionRef = (id: string) => doc(db, "connections", id);

export const connectionsQuery = (clientId: string) =>
  query(connectionsCol, where("clientId", "==", clientId), orderBy("createdAt", "desc"));

export const toConnection = (snap: DocumentSnapshot): Connection => {
  const data = snap.data({ serverTimestamps: "estimate" }) ?? {};
  return {
    id: snap.id,
    clientId: data.clientId,
    name: data.name,
    createdAt: toDate(data.createdAt),
  };
};

export const createConnection = (clientId: string, name: string) =>
  addDoc(connectionsCol, {
    clientId,
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateConnection = (id: string, name: string) =>
  updateDoc(connectionRef(id), { name: name.trim(), updatedAt: serverTimestamp() });

// Contatos e mensagens são removidos pela Cloud Function onConnectionDeleted.
export const deleteConnection = (id: string) => deleteDoc(connectionRef(id));
