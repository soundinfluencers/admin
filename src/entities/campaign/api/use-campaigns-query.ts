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
) => {
  return useQuery({
    queryKey: params
      ? campaignsQueryKeys.detail(params)
      : [...campaignsQueryKeys.details(), null],

    queryFn: params
      ? () => getCampaignById(params)
      : skipToken,

    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};
