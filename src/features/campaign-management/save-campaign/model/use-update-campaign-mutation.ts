import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaignById } from "@/entities/campaign";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys.ts";
import { mapCampaignToUpdateBody } from "./map-campaign-to-update-body";
import { toast } from "react-toastify";
import { notifyUnhandledApiError } from "@/app/api/errors/notify.ts";

import type {
  ICampaignDetails,
  IUpdateCampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types.ts";

type TSaveCampaignParams = Omit<
  IUpdateCampaignDetailsRequestParams,
  "body"
>;

type TSaveCampaignVariables = {
  params: TSaveCampaignParams;
  campaign: ICampaignDetails;
};

type TUseUpdateCampaignMutationOptions = {
  onSaved: (
    params: TSaveCampaignParams,
    campaign: ICampaignDetails,
  ) => void;
};

export const useUpdateCampaignMutation = ({
  onSaved,
}: TUseUpdateCampaignMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      campaign,
    }: TSaveCampaignVariables) => {
      const body = mapCampaignToUpdateBody(campaign, params.status);

      return updateCampaignById({
        ...params,
        body,
      });
    },

    onError: notifyUnhandledApiError,

    onSuccess: async (campaign, { params }) => {
      const queryKey = campaignsQueryKeys.detail(params);

      await queryClient.cancelQueries({
        queryKey,
        exact: true,
      });

      queryClient.setQueryData(queryKey, campaign);

      onSaved(params, campaign);

      await queryClient.invalidateQueries({
        queryKey: campaignsQueryKeys.lists(),
        refetchType: "none",
      });
      
      toast("Last save completed successfully.", {
        type: "success",
        autoClose: 3000,
        position: "top-right",
      });
    },

    retry: false,
  });
};
