import type { TRequestFilterStatus } from "@/entities/requests/model/requests.types.ts";

type TRequestFilterOption = {
  label: string;
  value: TRequestFilterStatus;
}

export const REQUEST_FILTER_OPTIONS = [
  { label: 'Clients', value: 'CLIENT' },
  { label: 'Influencers', value: 'INFLUENCER' },
  { label: 'Campaigns', value: 'CAMPAIGN' },
  { label: 'Pricing', value: 'PRICING' },
] as const satisfies readonly TRequestFilterOption[];
