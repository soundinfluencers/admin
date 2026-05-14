import type { TRequestType } from "@/entities/requests/model/requests.types.ts";

export const REQUEST_DETAILS_ROUTE_MAP = {
  NEW_CLIENT_REQUEST: (id) =>
    `/dashboard/requests/new-client/${id}`,

  NEW_INFLUENCER_REQUEST: id =>
    `/dashboard/requests/new-influencer/${id}`,

  CAMPAIGN_REQUEST: id =>
    `/dashboard/requests/campaign/${id}`,

  BESPOKE_CAMPAIGN_REQUEST: id =>
    `/dashboard/requests/bespoke-campaign/${id}`,

  PROPOSAL_CAMPAIGN_REQUEST: id =>
    `/dashboard/requests/proposal-campaign/${id}`,

  NEW_SOCIAL_ACCOUNT_REQUEST: id =>
    `/dashboard/requests/new-social-account/${id}`,

  PRICE_UPDATE_REQUEST: id =>
    `/dashboard/requests/price-update/${id}`,
} satisfies Record<TRequestType, (id: string) => string>;
