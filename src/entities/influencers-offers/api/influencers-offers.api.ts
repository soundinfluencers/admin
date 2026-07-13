import { $api } from "@/app/api/http.ts";
import type {
  ICreateInfluencersOfferRequest,
  IGetInfluencersOffersMatrixParams,
  IInfluencersOfferLinkRequest,
  IInfluencersOfferMutationResponse,
  IInfluencersOffersMatrixResponse,
  IPublishInfluencersOfferRequest,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const getInfluencersOffersMatrixApi = async (params: IGetInfluencersOffersMatrixParams) => {
  console.log('get influencers offers matrix with params: ', params);

  const { data } = await $api.get<IInfluencersOffersMatrixResponse>("/admin/offers", {
    params: params,
  });

  console.log('get influencers offers matrix response: ', data.data);

  return data.data;
}

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
  offerId,
}: IPublishInfluencersOfferRequest) => {
  const { data } = await $api.patch<IInfluencersOfferMutationResponse>(
    "/admin/offers/published",
    undefined,
    {
      params: { offerId },
    },
  );

  return data;
};
