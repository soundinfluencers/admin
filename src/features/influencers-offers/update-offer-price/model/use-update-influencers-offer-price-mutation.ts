import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfluencersOfferPriceApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import { influencersOffersQueryKeys } from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";
import type { IUpdateInfluencersOfferPriceRequest } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const useUpdateInfluencersOfferPriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IUpdateInfluencersOfferPriceRequest) =>
      updateInfluencersOfferPriceApi(request),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: influencersOffersQueryKeys.matrixRoot(),
      }),
  });
};
