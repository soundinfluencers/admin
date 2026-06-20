import type { TRequestFilterStatus, TRequestSpecifiedStatus, TRequestType } from "@/entities/requests/model/requests.types.ts";

export const REQUEST_TYPE = {
  NEW_CLIENT_REQUEST: "Client Registration",
  NEW_INFLUENCER_REQUEST: "Influencer Registration",
  CAMPAIGN_REQUEST: "Campaign Submission",
  BESPOKE_CAMPAIGN_REQUEST: "Bespoke Campaign Request",
  NEW_SOCIAL_ACCOUNT_REQUEST: "Additional Social Account",
  PRICE_UPDATE_REQUEST: "Rate Change Request",
} as const satisfies Record<TRequestType, string>;

export const REQUEST_SPECIFIED_STATUS = {
  WAITING_FOR_ADMIN: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NEGOTIATION: "Negotiation",
} as const satisfies Record<TRequestSpecifiedStatus, string>;

export const REQUEST_GROUP = {
  CLIENT: "Client",
  INFLUENCER: "Influencer",
  CAMPAIGN: "Campaign",
  PRICING: "Pricing",
} as const satisfies Record<TRequestFilterStatus, string>;
