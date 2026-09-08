import { $api } from '@/app/api/http.ts';
import type {
  ICampaignListResponse, IDeleteCampaignParams, IUpdateCampaignParams, IUpdateCampaignResponse,
  TGetCampaignParams,
} from "@/entities/campaign/model/campaign.types.ts";

export const getAllCampaigns = async (params: TGetCampaignParams) => {
  console.log('Fetching campaigns with params:', params);

  const { data } = await $api.get<ICampaignListResponse>('/admin/campaigns', {
    params,
  });

  console.log('Successfully fetched campaigns', data);

  return data.data;
};

export const updateCampaign = async ({
  campaignId,
  status,
  dto,
}: IUpdateCampaignParams) => {
  console.log(`Updating campaign ${campaignId} with status ${status} and data:`, dto);

  const { data } = await $api.patch<IUpdateCampaignResponse>(`/admin/campaigns/${status}/${campaignId}/meta`, dto);

  return data.data;
};

export const deleteCampaign = async ({ campaignId, status }: IDeleteCampaignParams) => {
  console.log(`Deleting campaign ${campaignId} with status ${status}`);

  await $api.delete(`/admin/campaigns/${status}/${campaignId}`);

  console.log(`Successfully deleted campaign ${campaignId}`);
};

export const uploadCampaignsXlsx = async (file: File) => {
  console.log('Sending XLSX file to server:', file);

  const formData = new FormData();
  formData.append('file', file);

  console.log('FormData prepared for upload:', formData.get('file'));

  await $api.post('/admin/campaigns/xlsx', formData);

  console.log('Successfully uploaded XLSX file');
};
