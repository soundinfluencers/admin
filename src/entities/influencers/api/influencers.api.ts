import { $api } from '@/app/api/http.ts';
import type {
  IInfluencersListResponse, IScrapperUpdateParams, IUpdateSocialAccountListResponse,
  TGetInfluencersListParams, UploadInfluencersListXlsxParams,
} from "@/entities/influencers/model/influencers-list.types.ts";
import type {
  ISocialAccountResponse,
  IUpdateListSocialAccountDto, TCreateSocialAccountParams,
  TDeleteSocialAccountParams, TGetSocialAccountParams, TUpdateSocialAccountDto,
} from "@/entities/influencers/model/social-account.types.ts";
import type {
  IInfluencerDetailsResponse, IUpdateInfluencerResponse,
  TUpdateInfluencerParams,
} from "@/entities/influencers/model/influencers.types.ts";

// INFLUENCERS LIST
export const getInfluencersList = async (params: TGetInfluencersListParams) => {
  console.log('Fetching influencers with params:', params);

  const { data } = await $api.get<IInfluencersListResponse>(`/admin/influencers/`, {
    params,
  });

  console.log('Successfully fetched influencers', data);

  return data.data;
};

export const updateListSocialAccount = async (dto: IUpdateListSocialAccountDto) => {
  console.log(`Updating influencer social account for influencer with data:`, dto);

  const { data } = await $api.patch<IUpdateSocialAccountListResponse>(`/admin/influencers/social-account`, dto);

  console.log('Successfully fetched influencers', data);

  return data.data;
};

export const updateListInfluencer = async ({
  influencerId,
  accountId,
  dto,
}: TUpdateInfluencerParams) => {
  console.log(`Updating influencer with ID: ${influencerId} and account ID: ${accountId} with data:`, dto);

  const { data } = await $api.patch<IUpdateSocialAccountListResponse>(`/admin/influencers/${influencerId}`,
    dto, {
      params: {
        accountId,
      },
    });

  console.log('Successfully updated influencer', data);

  return data.data;
};

// INFLUENCER DETAILS
export const getInfluencerById = async (influencerId: string) => {
  console.log(`Fetching influencer details for influencer ID: ${influencerId}`);

  const { data } = await $api.get<IInfluencerDetailsResponse>(`/admin/influencers/${influencerId}`);

  console.log('Successfully fetched influencer details', data);

  return data.data;
};

export const updateInfluencerDetails = async ({
  influencerId,
  dto,
}: TUpdateInfluencerParams) => {
  console.log(`Updating influencer details for influencer ID: ${influencerId} with data:`, dto);

  const { data } = await $api.patch<IUpdateInfluencerResponse>(`/admin/influencers/${influencerId}`, dto);

  console.log('Successfully updated influencer', data);

  return data.data;
};

// SOCIAL ACCOUNT DETAILS
export const getSocialAccountById = async ({
  influencerId,
  accountId,
  socialMedia,
}: TGetSocialAccountParams) => {
  console.log(`Fetching social account details for influencer ID: ${influencerId}, account ID: ${accountId}, social media: ${socialMedia}`);

  const { data } = await $api.get<ISocialAccountResponse>(`/admin/influencers/${influencerId}/${accountId}/${socialMedia}`);

  console.log('Successfully fetched social account details', data);

  return data.data;
}

export const createSocialAccount = async ({
  influencerId,
  socialMedia,
  dto,
}: TCreateSocialAccountParams) => {
  console.log(`Creating social account for influencer ID: ${influencerId}, social media: ${socialMedia} with data:`, dto);

  const { data } = await $api.post<IInfluencerDetailsResponse>(`/admin/influencers/${influencerId}/${socialMedia}`, dto);

  console.log('Successfully created social account', data);

  return data.data;
};

export const updateSocialAccount = async (dto: TUpdateSocialAccountDto) => {
  console.log(`Updating social account for influencer with data:`, dto);

  const { data } = await $api.patch<ISocialAccountResponse>(`/admin/influencers/social-account`, dto);

  console.log('Successfully updated social account', data);

  return data.data;
};

export const deleteSocialAccount = async ({
  influencerId,
  accountId,
  socialMedia,
}: TDeleteSocialAccountParams) => {
  console.log(`Deleting social account for influencer ID: ${influencerId}, account ID: ${accountId}, social media: ${socialMedia}`);

  await $api.delete(`/admin/influencers/${influencerId}/${accountId}/${socialMedia}`);

  console.log('Successfully deleted social account');
};

// Export influencers-list XLSX
export const uploadInfluencersXlsx = async ({
  file, socialMedia,
}: UploadInfluencersListXlsxParams) => {
  console.log('Sending XLSX file to server:', file);

  const formData = new FormData();
  formData.append('file', file);

  console.log('FormData prepared for upload:', formData.get('file'));

  await $api.post(`/admin/influencers/${socialMedia}/xlsx`, formData);

  console.log('Successfully uploaded XLSX file');
};

export const scrapperUploadInfluencer = async (dto: IScrapperUpdateParams) => {
  console.log(`Triggering scrapper upload for social media: ${dto.socialMedia} with client ID: ${dto.clientId}`);

  await $api.patch(`/scrapers/account-details/all`, dto);

  console.log('Successfully triggered scrapper upload');
};
