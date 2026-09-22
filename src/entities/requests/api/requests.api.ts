import { $api } from "@/app/api/http.ts";
import type {
  IGetListRequestsParams,
  IGetListRequestsResponse, IGetAdminRequestDetailsParams,
  IUpdateRequestStatusParams, IAdminRequestDetailsByType, IGetRequestDetailsResponse, TRequestType,
  IUpdateSocialAccountRequestPriceDto,
} from "@/entities/requests/model/requests.types.ts";

export const getRequestsList = async (params: IGetListRequestsParams) => {
  console.log('Fetching requests with params:', params);

  const { data } = await $api.get<IGetListRequestsResponse>(`/admin/requests`, {
    params,
  });

  console.log('Successfully fetched requests', data.data);

  return data.data;
}

export const getRequestDetailsApi = async <T extends TRequestType>(
  params: IGetAdminRequestDetailsParams<T>,
): Promise<IAdminRequestDetailsByType[T]> => {
  const { requestId, requestType } = params;

  const { data } = await $api.get<IGetRequestDetailsResponse<T>>(
    `/admin/requests/${requestId}/${requestType}`,
  );

  return data.data;
};

export const requestAnswerApi = async ({
  requestId,
  response,
}: IUpdateRequestStatusParams) => {
  console.log('Answering request with params:', requestId, response);

  await $api.patch(`/admin/requests/${requestId}/${response}`);

  console.log('Successfully answered request');
}

export const respondToNewInfluencerRequest = async ({
  requestId,
  ...body
}: IUpdateRequestStatusParams): Promise<void> => {
  console.log('Received request request with params:', requestId, body);

  await $api.patch(`/admin/requests/new-influencer/${requestId}`, body);

  console.log('Successfully responding request');
}

export const closeRequestApi = async ({
  requestId,
}: {
  requestId: string;
}): Promise<void> => {
  console.log('Fetching requests with params:', requestId);

  await $api.patch(`/admin/requests/${requestId}`);

  console.log('Successfully answered request');
};

export const updateInfluencerPrice = async ({
  requestId,
  body
}: IUpdateSocialAccountRequestPriceDto): Promise<void> => {
  console.log("Updating influencer price", requestId, body);

  await $api.patch(`/admin/requests/${requestId}/price`, body);

  console.log('Successfully updated social account');
};
