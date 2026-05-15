import { createContext } from "react";
import type { Socket } from "socket.io-client";

export type WhatsappMessageStatus = "sending" | "sent" | "failed";

export type WhatsappMessageStatusUpdate = {
  phone: string;
  status: WhatsappMessageStatus;
  date: string;
  error?: string;
};

export type RealtimeContextType = {
  socket: Socket | null;
  isConnected: boolean;
  clientId: string | null;
  lastWhatsappStatus: WhatsappMessageStatusUpdate | null;
};

export const RealtimeContext = createContext<RealtimeContextType | undefined>(
    undefined,
);