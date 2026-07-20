import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfluencersOfferLinkApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import {
  influencerClientOffersQueryKeys,
  influencersOffersQueryKeys,
} from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";
import type { IInfluencersOfferLinkRequest } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const useUpdateInfluencersOfferLinksMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requests: IInfluencersOfferLinkRequest[]) => {
      const results = await Promise.allSettled(
        requests.map(updateInfluencersOfferLinkApi),
      );

      return results.map((result) => {
        if (result.status === "rejected") {
          throw result.reason;
        }

        return result.value;
      });
    },

    onSettled: () =>
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
