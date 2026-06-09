import type { IBespokeCampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

type TBespokeCampaignCategory = "artist" | "music" | "event" | "other";

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

export const CAMPAIGN_INFO_FIELDS = {
  artist: [
    { key: "category", label: "Category:" },
    { key: "campaignGoal", label: "Campaign objective:" },
    { key: "contentLink", label: "Content link:" },
    { key: "budget", label: "Budget:" },
    { key: "targetTerritories", label: "Target territories:" },
    { key: "extraBriefs", label: "Extra briefs:" },
  ],
  music: [
    { key: "category", label: "Category:" },
    { key: "campaignGoal", label: "Campaign objective:" },
    { key: "contentLink", label: "Content link:" },
    { key: "trackLink", label: "Track link:" },
    { key: "releaseDate", label: "Release date:" },
    { key: "smartLink", label: "Linkfire / smartlink:" },
    { key: "budget", label: "Budget:" },
    { key: "targetTerritories", label: "Target territories:" },
    { key: "extraBriefs", label: "Extra briefs:" },
  ],
  event: [
    { key: "category", label: "Category:" },
    { key: "campaignGoal", label: "Campaign objective:" },
    { key: "contentLink", label: "Content link:" },
    { key: "ticketLink", label: "Ticket link:" },
    { key: "budget", label: "Budget:" },
    { key: "targetTerritories", label: "Target territories:" },
    { key: "extraBriefs", label: "Extra briefs:" },
  ],
  other: [
    { key: "category", label: "Category:" },
    { key: "targetTerritories", label: "Target territories:" },
  ],
} as const satisfies Record<
  TBespokeCampaignCategory,
  readonly TBespokeCampaignRequestField[]
>;

export const BESPOKE_CAMPAIGN_CATEGORY_LABEL = {
  artist: "Artist",
  music: "Music",
  event: "Event",
  other: "Other",
} as const satisfies Record<TBespokeCampaignCategory, string>;

export type TCampaignInfoFieldKey = (typeof CAMPAIGN_INFO_FIELDS)[TBespokeCampaignCategory][number]["key"];
