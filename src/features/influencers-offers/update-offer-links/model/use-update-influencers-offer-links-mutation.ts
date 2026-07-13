import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfluencersOfferLinkApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import { influencersOffersQueryKeys } from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";
import type { IInfluencersOfferLinkRequest } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const useUpdateInfluencersOfferLinksMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requests: IInfluencersOfferLinkRequest[]) =>
      Promise.all(requests.map(updateInfluencersOfferLinkApi)),

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: influencersOffersQueryKeys.matrixRoot(),
      });
    },
  });
};
