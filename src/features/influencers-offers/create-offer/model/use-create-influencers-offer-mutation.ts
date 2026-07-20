import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInfluencersOfferApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import {
  influencerClientOffersQueryKeys,
  influencersOffersQueryKeys,
} from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";

export const useCreateInfluencersOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInfluencersOfferApi,

    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: influencersOffersQueryKeys.matrixRoot(),
        }),
        queryClient.invalidateQueries({
          queryKey: influencerClientOffersQueryKeys.lists(),
        }),
      ]),
  });
};
