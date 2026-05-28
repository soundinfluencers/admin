import type {
  IGetAdminRequestDetailsParams,
  IGetListRequestsParams,
  TRequestType,
} from "@/entities/requests/model/requests.types.ts";

export const requestsQueryKeys = {
  all: ['requests'] as const,

  lists: () => [...requestsQueryKeys.all, 'list'] as const,

  list: (params: IGetListRequestsParams) =>
    [...requestsQueryKeys.lists(), params] as const,
};

export const requestDetailsQueryKeys = {
  all: ['request-details'] as const,

  details: () => [...requestDetailsQueryKeys.all, 'detail'] as const,

  detail: <T extends TRequestType>(
    params: IGetAdminRequestDetailsParams<T>,
  ) => [
    ...requestDetailsQueryKeys.details(),
    params.requestId,
    params.requestType,
  ] as const,
};
