import { useQuery } from "@tanstack/react-query";
import { getNewClientRequestApi, newClientQueryKeys } from "@/entities/requests/client-requests/new-client";

export const useGetNewClientRequestQuery = (requestId?: string) => {
  return useQuery({
    queryKey: newClientQueryKeys.detail(requestId),
    enabled: Boolean(requestId),
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }

      return getNewClientRequestApi({
        requestId,
        requestType: 'NEW_CLIENT_REQUEST',
      });
    },
  });
};
