import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfluencerPrice } from "@/entities/requests/api/requests.api.ts";
import { requestDetailsQueryKeys } from "@/entities/requests";

export const useUpdateSocialAccountPriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInfluencerPrice,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: requestDetailsQueryKeys.detail({
          requestId: variables.requestId,
          requestType: variables.requestType,
        }),
      });
    },
  });
};
