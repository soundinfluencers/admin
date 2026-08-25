import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishInfluencersOfferApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import {
  influencerClientOffersQueryKeys,
  influencersOffersQueryKeys,
} from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";
import type { IPublishInfluencersOffersRequest } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { toast } from "react-toastify";

export const usePublishInfluencersOffersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IPublishInfluencersOffersRequest) =>
      publishInfluencersOfferApi(request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: influencersOffersQueryKeys.matrixRoot(),
        }),
        queryClient.invalidateQueries({
          queryKey: influencerClientOffersQueryKeys.lists(),
        }),
      ]);

      toast("Offers published successfully", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};
