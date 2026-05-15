import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "react-toastify";

import { useAuth } from "@/app/providers/auth-provider/use-auth.ts";
import {
  RealtimeContext,
  type WhatsappMessageStatusUpdate,
} from "@/app/providers/realtime-provider/realtime-context.ts";

const SOCKET_CLIENT_ID_KEY = "soundinfluencers-admin:socket-client-id";
const WHATSAPP_SUCCESS_TOAST_ID = "whatsapp-success-once";

function getSocketClientId(): string {
  const existingClientId = sessionStorage.getItem(SOCKET_CLIENT_ID_KEY);

  if (existingClientId) {
    return existingClientId;
  }

  const clientId = crypto.randomUUID();
  sessionStorage.setItem(SOCKET_CLIENT_ID_KEY, clientId);

  return clientId;
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { accessToken, status } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lastWhatsappStatus, setLastWhatsappStatus] =
      useState<WhatsappMessageStatusUpdate | null>(null);

  const hasShownWhatsappSuccessRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setIsConnected(false);
      setSocket(null);
      setClientId(null);
      setLastWhatsappStatus(null);
      hasShownWhatsappSuccessRef.current = false;
      return;
    }

    const nextClientId = getSocketClientId();

    const nextSocket = io(import.meta.env.VITE_SERVER, {
      path: "/socket.io",
      auth: {
        token: accessToken,
        clientId: nextClientId,
      },
      withCredentials: true,
    });

    setClientId(nextClientId);
    setSocket(nextSocket);

    nextSocket.on("connect", () => {
      setIsConnected(true);
    });

    nextSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    nextSocket.on(
        "whatsappMessageStatusUpdate",
        (payload: WhatsappMessageStatusUpdate) => {
          setLastWhatsappStatus(payload);

          if (payload.status !== "sent") return;
          if (hasShownWhatsappSuccessRef.current) return;

          hasShownWhatsappSuccessRef.current = true;

          toast.success("WhatsApp messages sent successfully", {
            toastId: WHATSAPP_SUCCESS_TOAST_ID,
          });
        },
    );

    return () => {
      nextSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, [accessToken, status]);

  const value = useMemo(
      () => ({
        socket,
        isConnected,
        clientId,
        lastWhatsappStatus,
      }),
      [socket, isConnected, clientId, lastWhatsappStatus],
  );

  return (
      <RealtimeContext.Provider value={value}>
        {children}
      </RealtimeContext.Provider>
  );
}