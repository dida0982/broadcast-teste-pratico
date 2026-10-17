export type Client = {
  id: string;
  name: string;
  email: string;
};

export type Connection = {
  id: string;
  clientId: string;
  name: string;
  createdAt: Date | null;
};

export type Contact = {
  id: string;
  clientId: string;
  connectionId: string;
  name: string;
  phone: string;
};

export type MessageStatus = "scheduled" | "sent";

export type Message = {
  id: string;
  clientId: string;
  connectionId: string;
  contactIds: string[];
  body: string;
  status: MessageStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date | null;
};

export type MessageFilter = "all" | MessageStatus;
