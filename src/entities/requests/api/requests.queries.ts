import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRequestDetailsApi, getRequestsList } from "@/entities/requests/api/requests.api.ts";
import { requestsQueryKeys, requestDetailsQueryKeys } from "@/entities/requests";
import type {
  IAdminRequestDetailsByType,
  IGetAdminRequestDetailsParams,
  IGetListRequestsParams,
  TRequestType,
} from "@/entities/requests/model/requests.types.ts";

export const useRequestsQuery = (params: IGetListRequestsParams) => {
  return useQuery({
    queryKey: requestsQueryKeys.list(params),
    queryFn: () => getRequestsList(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

export const useGetDetailsRequestQuery = <T extends TRequestType>(
  params: IGetAdminRequestDetailsParams<T>,
) => {
  return useQuery<IAdminRequestDetailsByType[T]>({
    queryKey: requestDetailsQueryKeys.detail(params),
    queryFn: () => getRequestDetailsApi(params),
    staleTime: 0,
  });
};
