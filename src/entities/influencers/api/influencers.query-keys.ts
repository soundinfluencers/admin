// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { TGetSocialAccountParams } from "@/entities/influencers/model/social-account.types.ts";

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
  detail: (params: TGetSocialAccountParams) =>
    ["influencer-accounts", "detail", params] as const,
};
