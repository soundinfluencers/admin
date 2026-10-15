import { isAxiosError } from "axios";

import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { sendCampaignWhatsAppOne } from "@/entities/campaign";

import {
  WHATSAPP_STATUS,
  type ISendCampaignWhatsAppRequest,
} from "@/entities/campaign/model/campaign-whatsapp.types";

import type {
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types";

import type {
  TCampaignWhatsAppAttemptStatus,
} from "./campaign-whatsapp-attempt.types";

interface SendCampaignWhatsAppVariables {
  params: ICampaignDetailsRequestParams;
  requests: readonly ISendCampaignWhatsAppRequest[];

  onProgress: (
    influencerId: string,
    status: TCampaignWhatsAppAttemptStatus,
  ) => void;

  synchronize: (
    params: ICampaignDetailsRequestParams,
  ) => Promise<void>;
}

const isConfirmedSendFailure = (error: unknown): boolean => {
  if (!isAxiosError<{ message?: unknown }>(error)) {
    return false;
  }

  const response = error.response;

  if (!response) return false;

  if (response.status === 502) return true;

  return (
    response.status === 400 &&
    response.data?.message === "Influencer has no phone number"
  );
};

export const useSendCampaignWhatsAppMutation = (
  campaignId: string | null,
) => {
  const queryClient = useQueryClient();

  const mutationKey = [
    "campaign-whatsapp-send",
    campaignId,
  ] as const;

  const filters = {
    mutationKey,
    exact: true,
  };

  const pendingCount = useIsMutating(filters);

  const mutation = useMutation({
    mutationKey,
    retry: false,
    networkMode: "always",

    mutationFn: async ({
      params,
      requests,
      onProgress,
      synchronize,
    }: SendCampaignWhatsAppVariables) => {
      const results = await Promise.allSettled(
        requests.map(async (request) => {
          try {
            const response = await sendCampaignWhatsAppOne(
              request,
              { silentError: true },
            );

            if (response?.status !== WHATSAPP_STATUS.SENT) {
              throw new Error("Unexpected WhatsApp response");
            }

            onProgress(
              request.influencerId,
              WHATSAPP_STATUS.SENT,
            );

            return response;
          } catch (error) {
            onProgress(
              request.influencerId,
              isConfirmedSendFailure(error)
                ? WHATSAPP_STATUS.FAILED
                : "unknown",
            );

            throw error;
          }
        }),
      );

      let synchronized = true;

      try {
        await synchronize(params);
      } catch {
        synchronized = false;
      }

      const sent = results.filter(
        (result) => result.status === "fulfilled",
      ).length;

      const failed = results.filter(
        (result) =>
          result.status === "rejected" &&
          isConfirmedSendFailure(result.reason),
      ).length;

      return {
        total: results.length,
        sent,
        failed,
        unknown: results.length - sent - failed,
        synchronized,
      };
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: pendingCount > 0,

    isRunning: () =>
      queryClient.isMutating(filters) > 0,
  };
};
