import { keepPreviousData, useQuery, skipToken } from "@tanstack/react-query";
import { getAllCampaigns, getCampaignById } from "@/entities/campaign/api/campaign.api.ts";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys.ts";
import type { TGetCampaignParams } from "@/entities/campaign/model/campaign.types.ts";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types.ts";

export const useCampaignsQuery = (params: TGetCampaignParams)=> {
  return useQuery({
    queryKey: campaignsQueryKeys.list(params),
    queryFn: () => getAllCampaigns(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

export const useCampaignDetailsQuery = (
  params: ICampaignDetailsRequestParams | null,
  enabled = true,
  isDeletedOptionRecovery = false,
) => {
  return useQuery({
    queryKey: params
      ? campaignsQueryKeys.detail(params)
      : [...campaignsQueryKeys.details(), null],

    queryFn: params
      ? async () => {
        const campaign = await getCampaignById(
          params,
          isDeletedOptionRecovery ? { silentError: true } : undefined,
        );
        if (isDeletedOptionRecovery && (
          campaign.campaignId !== params.campaignId ||
          campaign.status !== "proposal" ||
          !campaign.existingOptions.includes(0)
        )) {
          throw new Error("The remaining proposal option could not be resolved.");
        }
        return campaign;
      }
      : skipToken,

    enabled: params !== null && enabled,
    ...(isDeletedOptionRecovery && { retry: false }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};
