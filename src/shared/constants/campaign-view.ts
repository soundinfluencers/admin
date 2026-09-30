export const CAMPAIGN_VIEW = {
  strategy: "strategy",
  insights: "insights",
  audience: "audience",
} as const;

export type TCampaignView = (typeof CAMPAIGN_VIEW)[keyof typeof CAMPAIGN_VIEW];

export const CAMPAIGN_VIEWS: readonly TCampaignView[] = Object.values(CAMPAIGN_VIEW); 

export const CAMPAIGN_VIEWS_LABELS = {
  [CAMPAIGN_VIEW.strategy]: "Campaign strategy",
  [CAMPAIGN_VIEW.insights]: "Campaign insights",
  [CAMPAIGN_VIEW.audience]: "Advanced insights",
} satisfies Record<TCampaignView, string>;

export const isCampaignView = (
  value: string,
): value is TCampaignView => {
  return CAMPAIGN_VIEWS.some((view) => view === value);
};
