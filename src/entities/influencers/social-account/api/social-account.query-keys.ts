import type { IGetSocialAccountRequest } from "../model/social-account.types";

export const socialAccountQueryKeys = {
  all: ["influencer-account"] as const,

  details: () => [...socialAccountQueryKeys.all, "detail"] as const,
  detail: (params: IGetSocialAccountRequest) =>
    [...socialAccountQueryKeys.details(), params] as const,
};
