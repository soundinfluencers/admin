import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  appendCampaignXlsx,
} from "@/entities/campaign/api/campaign.api";
import type {
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types";

interface BaseVariables {
  params: ICampaignDetailsRequestParams;
  synchronize: (
    params: ICampaignDetailsRequestParams,
  ) => Promise<void>;
}

type Variables = BaseVariables & (
  | {
  file: File;
  refreshOnly?: false;
}
  | {
  refreshOnly: true;
  file?: never;
}
  );

interface Result {
  needsCampaignRefresh: boolean;
}

const needsRefresh = (data: unknown): boolean =>
  typeof data === "object" &&
  data !== null &&
  "needsCampaignRefresh" in data &&
  data.needsCampaignRefresh === true;

const isRefreshOnly = (variables: unknown): boolean =>
  typeof variables === "object" &&
  variables !== null &&
  "refreshOnly" in variables &&
  variables.refreshOnly === true;

export const useAppendCampaignXlsxMutation = (
  campaignId: string | null,
) => {
  const queryClient = useQueryClient();

  const mutationKey = [
    "campaigns",
    "append-xlsx",
    campaignId,
  ] as const;

  const filters = {
    mutationKey,
    exact: true,
  };

  const states = useMutationState({
    filters,
    select: (mutation) => ({
      isPending: mutation.state.status === "pending",
      needsCampaignRefresh:
        mutation.state.status === "pending"
          ? isRefreshOnly(mutation.state.variables)
          : needsRefresh(mutation.state.data),
    }),
  });

  const getState = () => {
    const latest = queryClient
    .getMutationCache()
    .findAll(filters)
    .at(-1);

    return {
      mutationId: latest?.mutationId,
      isPending: latest?.state.status === "pending",
      needsCampaignRefresh:
        latest?.state.status === "pending"
          ? isRefreshOnly(latest.state.variables)
          : needsRefresh(latest?.state.data),
    };
  };

  const mutation = useMutation({
    mutationKey,
    gcTime: Infinity,
    retry: false,
    networkMode: "always",

    mutationFn: async (
      variables: Variables,
    ): Promise<Result> => {
      const { params, synchronize } = variables;

      if (!variables.refreshOnly) {
        try {
          await appendCampaignXlsx(
            {
              campaignId: params.campaignId,
              file: variables.file,
            },
            { silentError: true },
          );
        } catch (error) {
          toast.error(
            "Could not confirm the import. " +
            "The campaign may have changed. " +
            "Check the campaign before importing the file again.",
          );

          throw error;
        }
      }

      try {
        await synchronize(params);
      } catch {
        toast.warning(
          "Import completed, but the latest campaign data " +
          "could not be loaded. Use Retry data refresh.",
        );

        return {
          needsCampaignRefresh: true,
        };
      }

      toast.success(
        "Import completed. Campaign data has been refreshed.",
      );

      return {
        needsCampaignRefresh: false,
      };
    },
  });

  const latest = states.at(-1);

  const execute = (
    variables: Variables,
  ): Promise<Result | null> => {
    const state = getState();

    if (
      !campaignId ||
      variables.params.campaignId !== campaignId ||
      variables.params.status !== "distributing" ||
      state.isPending ||
      Boolean(variables.refreshOnly) !==
      state.needsCampaignRefresh
    ) {
      return Promise.resolve(null);
    }

    return mutation.mutateAsync(variables);
  };

  return {
    isAppendingCampaignXlsx: latest?.isPending ?? false,
    needsCampaignRefresh:
      latest?.needsCampaignRefresh ?? false,
    getState,
    execute,
  };
};
