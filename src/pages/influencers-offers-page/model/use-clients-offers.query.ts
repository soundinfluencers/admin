import { useQuery } from "@tanstack/react-query";
import { getClientsOffersApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import type { IGetOffersClientsParams } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { influencerClientOffersQueryKeys } from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";

export const useClientsOffersQuery = (params: IGetOffersClientsParams) => {
  return useQuery({
    queryKey: influencerClientOffersQueryKeys.list(params),
    queryFn: () => getClientsOffersApi(params),
    staleTime: 0,
  });
};
