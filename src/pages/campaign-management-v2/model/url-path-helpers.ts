import { CAMPAIGN_STATUSES, type TCampaignStatus } from "@/entities/campaign/model/campaign-details.types.ts";

export const isCampaignStatus = (
  value: string | undefined,
): value is TCampaignStatus => {
  return Object.values(CAMPAIGN_STATUSES).some(
    (status) => status === value,
  );
};
