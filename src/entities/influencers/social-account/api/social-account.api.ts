import { $api } from "@/app/api/http.ts";
import type {
  ISocialAccount,
  IGetSocialAccountRequest,
  IGetSocialAccountResponse,
  TCreateSocialAccountRequest,
  TUpdateSocialAccountDto,
  IDeleteSocialAccountRequest,
} from "../model/social-account.types.ts";
import type { IInfluencerDetails, IInfluencerDetailsResponse } from "@/entities/influencers/model/influencers.types.ts";

export const getSocialAccountByIdApi = async ({
  influencerId,
  accountId,
  socialMedia,
}: IGetSocialAccountRequest): Promise<ISocialAccount> => {
  console.log(`Fetching social account details for influencer ID: ${influencerId}, account ID: ${accountId}, social media: ${socialMedia}`);

  const { data } = await $api.get<IGetSocialAccountResponse>(`/admin/influencers/${influencerId}/${accountId}/${socialMedia}`);

  console.log('Successfully fetched social account details', data);

  return data.data;
}

export const createSocialAccountApi = async ({
  influencerId,
  socialMedia,
  dto,
}: TCreateSocialAccountRequest): Promise<IInfluencerDetails> => {
  console.log(`Creating social account for influencer ID: ${influencerId}, social media: ${socialMedia} with data:`, dto);

  const { data } = await $api.post<IInfluencerDetailsResponse>(`/admin/influencers/${influencerId}/${socialMedia}`, dto);

  console.log('Successfully created social account', data);

  return data.data;
};

export const updateSocialAccountApi = async (dto: TUpdateSocialAccountDto): Promise<ISocialAccount> => {
  console.log(`Updating social account for influencer with data:`, dto);

  const { data } = await $api.patch<IGetSocialAccountResponse>(`/admin/influencers/social-account`, dto);

  console.log('Successfully updated social account', data);

  return data.data;
};

export const deleteSocialAccountApi = async ({
  influencerId,
  accountId,
  socialMedia,
}: IDeleteSocialAccountRequest) => {
  console.log(`Deleting social account for influencer ID: ${influencerId}, account ID: ${accountId}, social media: ${socialMedia}`);

  await $api.delete(`/admin/influencers/${influencerId}/${accountId}/${socialMedia}`);

  console.log('Successfully deleted social account');
};
