import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAnswerApi, respondToNewInfluencerRequest } from "@/entities/requests/api/requests.api.ts";
import { requestsQueryKeys, requestDetailsQueryKeys } from "@/entities/requests";

export const useRequestAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestAnswerApi,

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: requestsQueryKeys.all,
      });

      queryClient.removeQueries({
        queryKey: [...requestDetailsQueryKeys.details(), variables.requestId],
      });
    },
  });
};

export const useNewInfluencerResponseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToNewInfluencerRequest,

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: requestsQueryKeys.all,
      });

      queryClient.removeQueries({
        queryKey: [...requestDetailsQueryKeys.details(), variables.requestId],
      });
    }
  })
};
