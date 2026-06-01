import type { TActionType } from "@/entities/influencer-history/model/influencer-history-detail.types.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";
import type { TPaymentMethod } from "@/shared/types/types.ts";
import type { TCampaignStatus } from "@/entities/campaign";

export interface IInfluencerHistoryDetailsTableRow {
  actionId: string;
  actionType: TActionType;

  dateAndTime: string;

  username: string | null;
  socialMedia: TSocialMediaValue | null;

  isStillInCampaign: boolean | null;
  campaignName: string | null;
  campaignId: string | null;
  campaignStatus: TCampaignStatus | null;
  reward: number;
  paymentMethod: TPaymentMethod | null;
  statusLabel: string | null;

  currentBalance: number;
}
