import { $api } from "@/app/api/http.ts";
import type {
  IGetInfluencersOffersMatrixParams, IInfluencersOffersMatrixResponse,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const getInfluencersOffersMatrixApi = async (params: IGetInfluencersOffersMatrixParams) => {
  console.log('get influencers offers matrix with params: ', params);

  const { data } = await $api.get<IInfluencersOffersMatrixResponse>("/admin/offers", {
    params: params,
  });

  console.log('get influencers offers matrix response: ', data.data);

  return data.data;
}

// export const publishOfferApi = async (dto: any) => {}
//
// export const updateAccountLinkApi = async (dto: any) => {}
//
// export const deleteOfferApi = async (dto: any) => {}
