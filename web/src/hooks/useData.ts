import { useMemo } from "react";
import { useRealtimeDoc, useRealtimeQuery } from "./useRealtime";
import { connectionRef, connectionsQuery, toConnection } from "../services/connections";
import { contactsQuery, toContact } from "../services/contacts";
import { messagesQuery, toMessage } from "../services/messages";

export const useConnections = (clientId: string) =>
  useRealtimeQuery(useMemo(() => connectionsQuery(clientId), [clientId]), toConnection);

export const useConnection = (connectionId: string) =>
  useRealtimeDoc(useMemo(() => connectionRef(connectionId), [connectionId]), toConnection);

export const useContacts = (clientId: string, connectionId: string) =>
  useRealtimeQuery(
    useMemo(() => contactsQuery(clientId, connectionId), [clientId, connectionId]),
    toContact,
  );

export const useMessages = (clientId: string, connectionId: string) =>
  useRealtimeQuery(
    useMemo(() => messagesQuery(clientId, connectionId), [clientId, connectionId]),
    toMessage,
  );
