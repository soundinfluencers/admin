import type { ICampaignDetailsRequestParams } from "../model/campaign-details.types.ts";

export const campaignsQueryKeys = {
  all: ["campaigns"] as const,
  
  list: <T>(params: T) => ["campaigns", "list", params] as const,
  lists: () => ['campaigns', 'list'] as const,

  details: () => ["campaigns", "details"] as const,
  detail: (params: ICampaignDetailsRequestParams) =>
    ["campaigns", "details", params] as const,
};
