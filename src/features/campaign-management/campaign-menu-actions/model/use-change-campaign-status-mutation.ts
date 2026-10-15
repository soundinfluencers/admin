import { useMutation, useQueryClient } from "@tanstack/react-query";

import { closeCampaign, reopenCampaign } from "@/entities/campaign";

import {
  campaignsQueryKeys,
} from "@/entities/campaign/api/campaign.query-keys";

import { notifyUnhandledApiError } from "@/app/api/errors/notify";

interface ChangeCampaignStatusVariables {
  campaignId: string;
  action: "close" | "reopen";
}

export const useChangeCampaignStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      action,
    }: ChangeCampaignStatusVariables) =>
      action === "close"
        ? closeCampaign(campaignId)
        : reopenCampaign(campaignId),

    retry: false,

    onMutate: async ({ campaignId }) => {
      await queryClient.cancelQueries({
        queryKey: [
          ...campaignsQueryKeys.details(),
          { campaignId },
        ],
      });
    },

    onSuccess: (_, { campaignId }) => {
      void queryClient.invalidateQueries({
        queryKey: [
          ...campaignsQueryKeys.details(),
          { campaignId },
        ],
        refetchType: "none",
      });

      void queryClient.invalidateQueries({
        queryKey: campaignsQueryKeys.lists(),
        refetchType: "none",
      });
    },

    onError: notifyUnhandledApiError,
  });
};
