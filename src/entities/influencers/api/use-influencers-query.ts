import { useQuery, keepPreviousData  } from "@tanstack/react-query";
import { influencersQueryKeys } from "@/entities/influencers/api/influencers.query-keys.ts";
import { getInfluencersList } from "@/entities/influencers/api/influencers.api.ts";
import type { TGetInfluencersListParams } from "@/entities/influencers/model/influencers-list.types.ts";

export const useInfluencersQuery = (params: TGetInfluencersListParams) => {
  return useQuery({
    queryKey: influencersQueryKeys.list(params),
    queryFn: () => getInfluencersList(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};
