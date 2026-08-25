import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closeRequestApi } from "@/entities/requests/api/requests.api.ts";
import { requestsQueryKeys, requestDetailsQueryKeys } from "@/entities/requests";

export const useCloseRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeRequestApi,

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
