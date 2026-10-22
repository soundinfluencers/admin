import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types";

type CampaignAccount = ICampaignDetails["addedAccounts"][number];

export type CampaignStrategyRow = Pick<
  CampaignAccount,
  | "addedAccountsId"
  | "username"
  | "socialMedia"
  | "followers"
  | "dateRequest"
  | "postLink"
  | "screenshot"
> & {
  contentLabel: string;
  description: string;
  brief: string;
  storyTag: string;
  storyLink: string;
};
