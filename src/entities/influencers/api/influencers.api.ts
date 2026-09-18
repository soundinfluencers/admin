import { $api } from '@/app/api/http.ts';
import type {
  IInfluencersListResponse, IScrapperUpdateParams, IUpdateSocialAccountListResponse,
  TGetInfluencersListParams, UploadInfluencersListXlsxParams,
} from "@/entities/influencers/model/influencers-list.types.ts";
import type {
  IInfluencerDetailsResponse, IUpdateInfluencerResponse,
  TUpdateInfluencerParams,
} from "@/entities/influencers/model/influencers.types.ts";
import type { IUpdateListSocialAccountDto } from "../social-account/model/social-account.types.ts";

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

export const deleteInfluencerById = async (influencerId: string) => {
  console.log("Start delete influencer", influencerId);

  await $api.delete(`/admin/influencers/${influencerId}`);

  console.log('Successfully deleted influencer', influencerId);
}

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
