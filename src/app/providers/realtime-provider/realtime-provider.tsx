import { useEffect, useMemo, useState, type ReactNode, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "react-toastify";

import { useAuth } from "@/app/providers/auth-provider/use-auth.ts";
import {
  RealtimeContext,
  type WhatsappMessageStatusUpdate,
} from "@/app/providers/realtime-provider/realtime-context.ts";
import type {
  ActiveAccountAccountsUpdate, NotificationFinishedRefreshingAccounts,
  RefreshAccountStatusUpdate,
} from "@/app/providers/realtime-provider/realtime.types.ts";
import { useQueryClient } from "@tanstack/react-query";
import { influencersQueryKeys } from "@/entities/influencers/api/influencers.query-keys.ts";
import { API_URL } from "@/shared/config/runtime-config.ts";

const SOCKET_CLIENT_ID_KEY = "soundinfluencers-admin:socket-client-id";
// const SCRAPPER_ACCOUNTS_FINISHED_TOAST_ID = "scrapper-accounts-finished-toast";

function getSocketClientId(): string {
  const existingClientId = sessionStorage.getItem(SOCKET_CLIENT_ID_KEY);

  if (existingClientId) {
    return existingClientId;
  }

  const clientId = crypto.randomUUID();
  sessionStorage.setItem(SOCKET_CLIENT_ID_KEY, clientId);

  return clientId;
}

// function isSuccessStatusCode(statusCode: number) {
//   return statusCode >= 200 && statusCode < 300;
// }

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { accessToken, status } = useAuth();
  const queryClient = useQueryClient();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lastWhatsappStatus, setLastWhatsappStatus] =
    useState<WhatsappMessageStatusUpdate | null>(null);

  const [
    activeAccountAccountsUpdates,
    setActiveAccountAccountsUpdates,
  ] = useState<ActiveAccountAccountsUpdate[]>([]);

  const [
    lastRefreshAccountStatus,
    setLastRefreshAccountStatus,
  ] = useState<RefreshAccountStatusUpdate | null>(null);

  const [
    lastFinishedRefreshingAccountsNotification,
    setLastFinishedRefreshingAccountsNotification,
  ] = useState<NotificationFinishedRefreshingAccounts | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setIsConnected(false);
      setSocket(null);
      setClientId(null);
      setLastWhatsappStatus(null);

      setActiveAccountAccountsUpdates([]);
      setLastRefreshAccountStatus(null);
      setLastFinishedRefreshingAccountsNotification(null);

      return;
    }

    const nextClientId = getSocketClientId();

    const nextSocket = io(API_URL, {
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

    const handleWhatsappStatusUpdate = (
      payload: WhatsappMessageStatusUpdate,
    ) => {
      setLastWhatsappStatus(payload);
    };

    nextSocket.on("whatsappMessageStatusUpdate", handleWhatsappStatusUpdate);
    nextSocket.on("whatsappBulkStatusUpdate", handleWhatsappStatusUpdate);

    const handleActiveAccountAccountsUpdates = (
      payload: ActiveAccountAccountsUpdate[],
    ) => {
      console.log("Received activeAccountAccountsUpdates:", payload);
      setActiveAccountAccountsUpdates(payload);
    };

    const handleRefreshAccountStatusUpdate = (
      payload: RefreshAccountStatusUpdate,
    ) => {
      setLastRefreshAccountStatus(payload);

      /**
       * обновлять cache через queryClient.setQueryData,
       * сразу менять followers/logo/engagementRate в таблице.
       */
    };

    const handleNotificationFinishedRefreshingAccounts = (
      payload: NotificationFinishedRefreshingAccounts,
    ) => {
      setLastFinishedRefreshingAccountsNotification(payload);

      setActiveAccountAccountsUpdates((prev) =>
        prev.filter((item) => item.socialMedia !== payload.socialMedia),
      );

      toast.dismiss(`scrapper-accounts-started:${payload.socialMedia}`);

      const isSuccess = payload.statusCode >= 200 && payload.statusCode < 300;

      if (isSuccess) {
        toast.success(`${payload.socialMedia} accounts update finished`, {
          toastId: `scrapper-accounts-finished:${payload.socialMedia}`,
        });

        void queryClient.invalidateQueries({
          queryKey: influencersQueryKeys.lists(),
        });

        return;
      }

      toast.error(`${payload.socialMedia} accounts update failed`, {
        toastId: `scrapper-accounts-failed:${payload.socialMedia}`,
      });
    };

    nextSocket.on(
      "activeAccountAccountsUpdates",
      handleActiveAccountAccountsUpdates,
    );

    nextSocket.on(
      "refreshAccountStatusUpdate",
      handleRefreshAccountStatusUpdate,
    );

    nextSocket.on(
      "notificationFinishedRefreshingAccounts",
      handleNotificationFinishedRefreshingAccounts,
    );


    return () => {
      nextSocket.disconnect();
      setIsConnected(false);
      setSocket(null);

      nextSocket.off(
        "activeAccountAccountsUpdates",
        handleActiveAccountAccountsUpdates,
      );

      nextSocket.off(
        "refreshAccountStatusUpdate",
        handleRefreshAccountStatusUpdate,
      );

      nextSocket.off(
        "notificationFinishedRefreshingAccounts",
        handleNotificationFinishedRefreshingAccounts,
      );

      nextSocket.off("whatsappMessageStatusUpdate", handleWhatsappStatusUpdate);
      nextSocket.off("whatsappBulkStatusUpdate", handleWhatsappStatusUpdate);

    };
  }, [accessToken, queryClient, status]);

  const isAccountAccountsUpdating = useCallback(
    (params: {
      socialMedia?: string;
      accountId?: string;
      influencerId?: string;
    }) => {
      return activeAccountAccountsUpdates.some((item) => {
        const socialMediaMatched =
          !params.socialMedia || item.socialMedia === params.socialMedia;

        const accountMatched =
          !params.accountId || item.accountId === params.accountId;

        const influencerMatched =
          !params.influencerId || item.influencerId === params.influencerId;

        return socialMediaMatched && accountMatched && influencerMatched;
      });
    },
    [activeAccountAccountsUpdates],
  );

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      clientId,
      lastWhatsappStatus,

      activeAccountAccountsUpdates,
      lastRefreshAccountStatus,
      lastFinishedRefreshingAccountsNotification,

      isAccountAccountsUpdating,
    }),
    [socket, isConnected, clientId, lastWhatsappStatus, activeAccountAccountsUpdates, lastRefreshAccountStatus, lastFinishedRefreshingAccountsNotification, isAccountAccountsUpdating],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
