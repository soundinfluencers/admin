import { useQuery } from "@tanstack/react-query";
import { getNegotiateMessages } from "../api/negotiate.api.ts";
import { negotiateQueryKeys } from "../api/negotiate.query-keys.ts";
import type { TRequestSpecifiedStatus } from "@/entities/requests/model/requests.types.ts";

interface UseGetNegotiateQueryParams {
  requestId: string;
  requestStatus: TRequestSpecifiedStatus;
}

export const useGetNegotiateQuery = ({
  requestId,
  requestStatus,
}: UseGetNegotiateQueryParams) => {

  const isEnabled = requestStatus === "NEGOTIATION" && Boolean(requestId);

  return useQuery({
    queryKey: negotiateQueryKeys.detail(requestId),
    queryFn: () => getNegotiateMessages(requestId),
    staleTime: 0,
    enabled: isEnabled,
  });
};
