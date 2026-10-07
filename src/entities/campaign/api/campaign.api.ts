import { $api } from '@/app/api/http.ts';
import type {
  ICampaignListResponse, IDeleteCampaignParams,
  IUpdateCampaignParams, IUpdateCampaignResponse,
  TGetCampaignParams,
} from "@/entities/campaign/model/campaign.types.ts";
import type {
  ICampaignDetails,
  ICampaignDetailsRequestParams,
  ICampaignDetailsResponse,
  ICreateProposalOptionRequestParams,
  ICreateProposalResponse,
  IMarkPromoPaidParams,
  IMarkPromoPaidResponse, IUpdateCampaignDetailsRequestParams, IUpdateCampaignDetailsResponse,
} from "../model/campaign-details.types.ts";

export const getAllCampaigns = async (params: TGetCampaignParams) => {
  const { data } = await $api.get<ICampaignListResponse>('/admin/campaigns', {
    params,
  });

  return data.data;
};

export const updateCampaign = async ({
  campaignId,
  status,
  dto,
}: IUpdateCampaignParams) => {
  const { data } = await $api.patch<IUpdateCampaignResponse>(`/admin/campaigns/${status}/${campaignId}/meta`, dto);

  return data.data;
};

export const deleteCampaign = async ({ campaignId, status }: IDeleteCampaignParams) => {
  await $api.delete(`/admin/campaigns/${status}/${campaignId}`);
};

export const uploadCampaignsXlsx = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  await $api.post('/admin/campaigns/xlsx', formData);
};

export const getCampaignById = async ({
  campaignId,
  status,
  optionIndex,
}: ICampaignDetailsRequestParams): Promise<ICampaignDetails> => {
  const { data } = await $api.get<ICampaignDetailsResponse>(`/admin/campaigns/${status}/${campaignId}`,
    {
      params: { optionIndex },
    },
  );

  return data.data;
};

export const updateCampaignById = async ({
  campaignId,
  status,
  optionIndex,
  body,
}: IUpdateCampaignDetailsRequestParams): Promise<IUpdateCampaignDetailsResponse["data"]> => {
  const { data } = await $api.patch<IUpdateCampaignDetailsResponse>(
    `/admin/campaigns/${status}/${campaignId}`,
    body,
    {
      params: { optionIndex },
    },
  );
  
  return data.data;
};

export const markPromoAsPaid = async ({
  campaignId,
  promoId,
}: IMarkPromoPaidParams): Promise<IMarkPromoPaidResponse["data"]> => {
  const { data } = await $api.patch<IMarkPromoPaidResponse>(`/admin/campaigns/${campaignId}/pay/${promoId}`);

  return data.data;
};

export const createProposalOption = async ({
  campaignId,
  body,
}: ICreateProposalOptionRequestParams): Promise<ICreateProposalResponse["data"]> => {
  const { data } = await $api.post<ICreateProposalResponse>(
    `/proposal-system`,
    body,
    {
      params: { campaignId },
    },
  );

  return data.data;
};
