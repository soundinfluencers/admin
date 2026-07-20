import { $api } from "@/app/api/http.ts";
import type {
  ICreateInfluencersOfferRequest,
  IDeleteInfluencersOfferRequest,
  IGetInfluencersOffersMatrixParams,
  IGetOffersClientsParams,
  IGetOffersClientsResponse,
  IInfluencersOfferLinkRequest,
  IInfluencersOfferMutationResponse,
  IInfluencersOffersMatrixResponse,
  IPublishInfluencersOffersRequest,
  IUpdateInfluencersOfferPriceRequest,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const getInfluencersOffersMatrixApi = async (params: IGetInfluencersOffersMatrixParams) => {
  const { data } = await $api.get<IInfluencersOffersMatrixResponse>("/admin/offers/matrix-view", {
    params: params,
  });

  return data.data;
};

export const createInfluencersOfferApi = async (dto: ICreateInfluencersOfferRequest) => {
  const { data } = await $api.post<IInfluencersOfferMutationResponse>(
    "/admin/offers",
    dto,
  );

  return data;
};

export const updateInfluencersOfferLinkApi = async ({
  offerId,
  influencerId,
  accountId,
  connected,
}: IInfluencersOfferLinkRequest) => {
  const { data } = await $api.patch<IInfluencersOfferMutationResponse>(
    `/admin/offers/${offerId}/links/${influencerId}/${accountId}/${connected}`,
  );

  return data;
};

export const publishInfluencersOfferApi = async ({
  socialMedia,
  genre,
}: IPublishInfluencersOffersRequest) => {
  const { data } = await $api.patch<IInfluencersOfferMutationResponse>(
    `/admin/offers/change-published-status/${socialMedia}/${genre}`,
  );

  return data;
};

export const updateInfluencersOfferPriceApi = async ({
  offerId,
  field,
  value,
}: IUpdateInfluencersOfferPriceRequest) => {
  const { data } = await $api.patch<IInfluencersOfferMutationResponse>(
    `/admin/offers/${offerId}`,
    {
      field,
      value,
    },
  );

  return data;
};

export const deleteInfluencersOfferApi = async ({
  offerId,
}: IDeleteInfluencersOfferRequest) => {
  const { data } = await $api.delete<IInfluencersOfferMutationResponse>(
    `/admin/offers/${offerId}`,
  );

  return data;
};

export const getClientsOffersApi = async (params: IGetOffersClientsParams) => {
  const { data } = await $api.get<IGetOffersClientsResponse>("/admin/offers/client-view", {
    params: params,
  });

  return data.data;
}
