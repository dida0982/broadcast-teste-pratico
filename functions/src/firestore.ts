import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, type Query, type DocumentReference, type UpdateData, type DocumentData } from "firebase-admin/firestore";
import { BATCH_SIZE } from "./config";

if (getApps().length === 0) initializeApp();

export const db = getFirestore();

// Busca páginas de um query e aplica uma operação em lote até esgotar os resultados.
// Cada página é processada e removida do resultado (via update/delete),
// por isso o mesmo query é reexecutado sem cursor.
export const drainQuery = async (
  query: Query,
  apply: (batch: FirebaseFirestore.WriteBatch, ref: DocumentReference) => void,
): Promise<number> => {
  const run = async (total: number): Promise<number> => {
    const snap = await query.limit(BATCH_SIZE).get();
    if (snap.empty) return total;

    const batch = db.batch();
    snap.docs.forEach((doc) => apply(batch, doc.ref));
    await batch.commit();

    return snap.size < BATCH_SIZE ? total + snap.size : run(total + snap.size);
  };
  return run(0);
};

export const deleteAll = (query: Query) =>
  drainQuery(query, (batch, ref) => batch.delete(ref));

export const updateAll = (query: Query, data: UpdateData<DocumentData>) =>
  drainQuery(query, (batch, ref) => batch.update(ref, data));
