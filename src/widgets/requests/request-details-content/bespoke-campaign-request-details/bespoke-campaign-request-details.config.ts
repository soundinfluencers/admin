import type { IBespokeCampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

type TBespokeCampaignRequestField = {
  key: keyof IBespokeCampaignRequestDetailsDto;
  label: string;
};

export const PERSONAL_INFO_FIELDS = [
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "email", label: "Email:" },
  { key: "phoneNumber", label: "Phone:" },
] as const satisfies readonly TBespokeCampaignRequestField[];

export const CAMPAIGN_INFO_FIELDS = [
  { key: "category", label: "Category:" },
  { key: "campaignGoal", label: "Campaign objective:" },
  { key: "contentLink", label: "Content link:" },
  { key: "budget", label: "Budget:" },
  { key: "targetTerritories", label: "Target territories:" },
  { key: "extraBriefs", label: "Extra briefs:" },
] as const satisfies readonly TBespokeCampaignRequestField[];
