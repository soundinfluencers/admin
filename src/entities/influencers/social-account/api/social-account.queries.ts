import { useQuery } from "@tanstack/react-query";
import { getSocialAccountByIdApi } from "./social-account.api.ts";
import { socialAccountQueryKeys } from "./social-account.query-keys.ts";
import type { TPlatform } from "@/shared/types/types.ts";

type TUseSocialAccountQueryParams = {
  influencerId?: string;
  accountId?: string;
  socialMedia?: TPlatform | null;
};

export const useSocialAccountQuery = ({
  influencerId,
  accountId,
  socialMedia,
}: TUseSocialAccountQueryParams) => {
  const params =
    influencerId && accountId && socialMedia
      ? { influencerId, accountId, socialMedia }
      : null;

  return useQuery({
    queryKey: params
      ? socialAccountQueryKeys.detail(params)
      : [...socialAccountQueryKeys.details(), "disabled"],

    queryFn: () => getSocialAccountByIdApi(params!),
    enabled: !!params,
    staleTime: 0,
  });
}
