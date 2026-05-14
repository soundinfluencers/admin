import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newClientQueryKeys, updateNewClientRequest } from "@/entities/requests/client-requests/new-client";
import { requestsQueryKeys } from "@/entities/requests";
import { useNavigate } from "react-router-dom";

export const useUpdateNewClientRequestMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateNewClientRequest,

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: requestsQueryKeys.all,
      });

      queryClient.removeQueries({
        queryKey: newClientQueryKeys.detail(
          variables.requestId,
        ),
      });

      navigate(-1);
    },
  });
};
