import type { IGetSocialAccountRequest } from "@/entities/influencers/social-account/model/social-account.types.ts";

export const influencersQueryKeys = {
  all: ["influencers"] as const,

  lists: () => ["influencers", "list"] as const,
  list: <T>(params: T) => ["influencers", "list", params] as const,

  details: () => ["influencers", "detail"] as const,
  detail: (id: string) => ["influencers", "detail", id] as const,
};

export const influencerAccountsQueryKeys = {
  all: ["influencer-accounts"] as const,

  details: () => ["influencer-accounts", "detail"] as const,
  detail: (params: IGetSocialAccountRequest) =>
    ["influencer-accounts", "detail", params] as const,
};
