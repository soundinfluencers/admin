import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveProposalOption } from "@/entities/campaign/api/campaign.api";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys";
import { notifyUnhandledApiError } from "@/app/api/errors/notify";

const campaignDetailsFilter = (campaignId: string) => ({
  queryKey: [
    ...campaignsQueryKeys.details(),
    { campaignId },
  ],
});

export const useApproveProposalOptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveProposalOption,
    
    networkMode: "always",

    onMutate: async ({ campaignId }) => {
      await queryClient.cancelQueries(
        campaignDetailsFilter(campaignId),
      );
    },

    onSuccess: async (result, { campaignId }) => {
      const campaignIds = [
        ...new Set([campaignId, result.campaignId]),
      ];

      await Promise.all(
        campaignIds.map((id) =>
          queryClient.cancelQueries(campaignDetailsFilter(id)),
        ),
      );

      await Promise.all([
        ...campaignIds.map((id) =>
          queryClient.invalidateQueries({
            ...campaignDetailsFilter(id),
            refetchType: "none",
          }),
        ),

        queryClient.invalidateQueries({
          queryKey: campaignsQueryKeys.lists(),
          refetchType: "none",
        }),
      ]);
    },

    onError: notifyUnhandledApiError,
  });
};
