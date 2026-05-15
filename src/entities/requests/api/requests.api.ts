import { $api} from "@/app/api/http.ts";
import type { IGetListRequestsRequest, IGetListRequestsResponse } from "@/entities/requests";

export const getRequestsList = async (params: IGetListRequestsRequest) => {
  console.log('Fetching requests with params:', params);

  const { data } = await $api.get<IGetListRequestsResponse>(`/admin/requests`, {
    params,
  });

  console.log('Successfully fetched requests', data.data);

  return data.data;
}
