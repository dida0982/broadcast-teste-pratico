import { useEffect, useState } from "react";
import {
  onSnapshot,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
} from "firebase/firestore";

type RealtimeState<T> = { data: T; loading: boolean; error: Error | null };

// Assina um query do Firestore em tempo real.
// `query` deve ser memoizado (useMemo) pelo chamador.
export const useRealtimeQuery = <T,>(
  query: Query | null,
  map: (snap: DocumentSnapshot) => T,
): RealtimeState<T[]> => {
  const [state, setState] = useState<RealtimeState<T[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    if (!query) return;
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      query,
      (snap) => setState({ data: snap.docs.map(map), loading: false, error: null }),
      (error) => setState({ data: [], loading: false, error }),
    );
  }, [query, map]);

  return state;
};

// Assina um documento em tempo real; `data` é null se não existir ou sem permissão.
export const useRealtimeDoc = <T,>(
  ref: DocumentReference | null,
  map: (snap: DocumentSnapshot) => T,
): RealtimeState<T | null> => {
  const [state, setState] = useState<RealtimeState<T | null>>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!ref) return;
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      ref,
      (snap) => setState({ data: snap.exists() ? map(snap) : null, loading: false, error: null }),
      (error) => setState({ data: null, loading: false, error }),
    );
  }, [ref, map]);

  return state;
};
