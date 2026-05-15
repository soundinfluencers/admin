import { $api } from "@/app/api/http.ts";
import type {
  INewClientRequestRequest,
  INewClientRequestResponse, IUpdateNewClientRequestStatusRequest,
} from "@/entities/requests/client-requests/new-client";

export const getNewClientRequestApi = async ({
  requestId,
  requestType,
}: INewClientRequestRequest) => {
  console.log('Get New Client Request', requestId, requestType);

  const { data } = await $api.get<INewClientRequestResponse>(`/admin/requests/${requestId}/${requestType}`);

  console.log('Get New Client Request Response', data.data);

  return data.data;
};

export const updateNewClientRequest = async ({
  requestId,
  response,
}: IUpdateNewClientRequestStatusRequest) => {
  console.log('Update New Client Request', requestId, response);

  await $api.patch(`/admin/requests/${requestId}/${response}`);

  console.log('Successfully update New Client Request Response', response);
};
