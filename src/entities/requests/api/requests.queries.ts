import { getRequestsList, requestsQueryKeys, type IGetListRequestsRequest } from "@/entities/requests";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useRequestsQuery = (params: IGetListRequestsRequest) => {
  return useQuery({
    queryKey: requestsQueryKeys.list(params),
    queryFn: () => getRequestsList(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
