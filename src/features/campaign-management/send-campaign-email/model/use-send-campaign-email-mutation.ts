import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { sendCampaignEmail } from "@/entities/campaign";

export const useSendCampaignEmailMutation = (
  campaignId: string | null,
) => {
  const queryClient = useQueryClient();

  const mutationKey = [
    "campaign-email-send",
    campaignId,
  ] as const;

  const filters = {
    mutationKey,
    exact: true,
  };

  const pendingCount = useIsMutating(filters);

  const mutation = useMutation({
    mutationKey,
    mutationFn: sendCampaignEmail,
    retry: false,
    networkMode: "always",
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: pendingCount > 0,
    isRunning: () => queryClient.isMutating(filters) > 0,
  };
};
