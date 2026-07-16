import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInfluencersOfferApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import { influencersOffersQueryKeys } from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";

export const useCreateInfluencersOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInfluencersOfferApi,

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: influencersOffersQueryKeys.matrixRoot(),
      }),
  });
};
