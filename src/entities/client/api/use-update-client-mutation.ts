import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsQueryKeys } from "@/entities/client/api/client.query-keys.ts";
import { updateClient } from "@/entities/client/api/client.api.ts";
import type { IClientDetails } from "@/entities/client/model/client.types.ts";

export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (updatedClient, variables) => {
      queryClient.setQueryData(
        clientsQueryKeys.detail(variables.clientId),
        (oldData: IClientDetails | undefined) => {
          if (!oldData) return oldData;

          console.log("Updating client in cache with data:", updatedClient);

          return {
            ...oldData,
            ...updatedClient,
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.lists(),
      });
    },
  });
};
