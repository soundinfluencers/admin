import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInfluencersOfferApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import { influencersOffersQueryKeys } from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";
import type { IDeleteInfluencersOfferRequest } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const useDeleteInfluencersOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IDeleteInfluencersOfferRequest) =>
      deleteInfluencersOfferApi(request),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: influencersOffersQueryKeys.matrixRoot(),
      }),
  });
};
