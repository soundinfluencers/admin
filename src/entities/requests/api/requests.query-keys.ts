import type { IGetListRequestsRequest } from "@/entities/requests";

export const requestsQueryKeys = {
  all: ['requests'] as const,

  lists: () => [...requestsQueryKeys.all, 'list'] as const,

  list: (params: IGetListRequestsRequest) =>
    [...requestsQueryKeys.lists(), params] as const,
};
