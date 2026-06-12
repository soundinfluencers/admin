import { parseAsStringLiteral } from "nuqs";
import { CAMPAIGN_STATUSES } from "@/entities/campaign";
import type { TCampaignStatus, TViewCampaignMode } from "./campaign.types";

export const campaignStatusValues: TCampaignStatus[] =
  CAMPAIGN_STATUSES.map((status) => status.value);

export const campaignStatusParser =
  parseAsStringLiteral(campaignStatusValues);

const campaignsMode: TViewCampaignMode[] = ['affiliate', 'payments'];

export const campaignsModeParser = parseAsStringLiteral(campaignsMode).withDefault("payments");
