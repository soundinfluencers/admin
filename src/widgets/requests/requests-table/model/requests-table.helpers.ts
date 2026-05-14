import type { TRequestType } from "@/entities/requests/model/requests.types.ts";

export const normalizeRequestType = (requestType: TRequestType) => {
  switch (requestType) {
    case "NEW_CLIENT_REQUEST":
      return "New client accounts";

    case "NEW_INFLUENCER_REQUEST":
      return "New partner";

    case  "CAMPAIGN_REQUEST":
      return "Campaign Post Request";

    case "BESPOKE_CAMPAIGN_REQUEST":
      return "Agency campaign request";

    case "PROPOSAL_CAMPAIGN_REQUEST":
      return "Proposal Campaign Post Request";

    case "NEW_SOCIAL_ACCOUNT_REQUEST":
      return "New social media accounts";

    case "PRICE_UPDATE_REQUEST":
      return "Price update request";

    default:
      return '—';
  }
}
