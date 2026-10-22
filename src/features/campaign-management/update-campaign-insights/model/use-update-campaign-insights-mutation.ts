import { useMutation, useMutationState, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateCampaignInsights } from "@/entities/campaign";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types";

interface Variables {
  params: ICampaignDetailsRequestParams;
  campaignName: string;
  refreshOnly?: boolean;
  synchronize: (params: ICampaignDetailsRequestParams) => Promise<void>;
}

interface Result {
  needsInsightsRefresh: boolean;
}

const needsRefresh = (data: unknown): boolean =>
  typeof data === "object" && data !== null &&
  "needsInsightsRefresh" in data && data.needsInsightsRefresh === true;

const isRefreshOnly = (variables: unknown): boolean =>
  typeof variables === "object" && variables !== null &&
  "refreshOnly" in variables && variables.refreshOnly === true;

export const useUpdateCampaignInsightsMutation = (campaignId: string | null) => {
  const queryClient = useQueryClient();
  const mutationKey = ["campaigns", "update-insights", campaignId] as const;
  const filters = { mutationKey, exact: true };

  // The cache, rather than the observer, owns this operation across page remounts.
  const states = useMutationState({
    filters,
    select: (mutation) => ({
      isPending: mutation.state.status === "pending",
      needsInsightsRefresh: mutation.state.status === "pending"
        ? isRefreshOnly(mutation.state.variables)
        : needsRefresh(mutation.state.data),
    }),
  });

  const getState = () => {
    const latest = queryClient.getMutationCache().findAll(filters).at(-1);
    return {
      mutationId: latest?.mutationId,
      isPending: latest?.state.status === "pending",
      needsInsightsRefresh: latest?.state.status === "pending"
        ? isRefreshOnly(latest.state.variables)
        : needsRefresh(latest?.state.data),
    };
  };

  const mutation = useMutation({
    mutationKey,
    gcTime: Infinity,
    retry: false,
    networkMode: "always",
    mutationFn: async ({
      params, campaignName, refreshOnly, synchronize,
    }: Variables): Promise<Result> => {
      if (!refreshOnly) {
        try {
          await updateCampaignInsights(
            { campaignId: params.campaignId, campaignName },
            { silentError: true },
          );
        } catch (error) {
          toast.error(
            "Could not confirm insights processing. The campaign may have changed. " +
            "Try again explicitly if needed.",
          );
          throw error;
        }
      }

      try {
        await synchronize(params);
      } catch {
        toast.warning(
          "Processing completed, but saved metrics could not be loaded. " +
          "Use Retry data refresh.",
        );
        return { needsInsightsRefresh: true };
      }

      toast.success("Processing completed. Saved campaign metrics have been loaded.");
      return { needsInsightsRefresh: false };
    },
  });

  const latest = states.at(-1);

  return {
    isUpdatingInsights: latest?.isPending ?? false,
    needsInsightsRefresh: latest?.needsInsightsRefresh ?? false,
    getState,
    execute: (variables: Variables) => {
      const state = getState();
      if (state.isPending || Boolean(variables.refreshOnly) !== Boolean(state.needsInsightsRefresh)) {
        return Promise.resolve();
      }
      return mutation.mutateAsync(variables);
    },
  };
};
