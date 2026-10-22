import { $api } from '@/app/api/http.ts';

import type {
  ApiRequestConfig,
  ApiRequestOptions,
} from "@/app/api/types.ts";

import type {
  ICampaignListResponse, 
  IDeleteCampaignParams,
  IUpdateCampaignParams, 
  IUpdateCampaignResponse,
  TGetCampaignParams,
} from "@/entities/campaign/model/campaign.types.ts";

import type {
  IAppendCampaignXlsxRequestParams,
  IApproveProposalOptionParams, IApproveProposalOptionResponse,
  ICampaignDetails,
  ICampaignDetailsRequestParams,
  ICampaignDetailsResponse,
  ICreateProposalOptionRequestParams,
  ICreateProposalResponse,
  IDeleteProposalOptionParams,
  IMarkPromoPaidParams,
  IMarkPromoPaidResponse,
  IUpdateCampaignDetailsRequestParams,
  IUpdateCampaignDetailsResponse,
} from "../model/campaign-details.types.ts";

import type { ISendCampaignWhatsAppRequest, ISendCampaignWhatsAppResponse } from "../model/campaign-whatsapp.types.ts";

import type { ISendCampaignEmailRequest } from "../model/campaign-email.types";

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

export const appendCampaignXlsx = async ({
    campaignId,
    file,
  }: IAppendCampaignXlsxRequestParams,
  options: ApiRequestOptions = {},
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  const config: ApiRequestConfig = {
    silentError: options.silentError,
  };

  await $api.post<void>(
    `/admin/campaigns/${encodeURIComponent(campaignId)}/xlsx`,
    formData,
    config,
  );
};

export const getCampaignById = async (
  {
    campaignId,
    status,
    optionIndex,
  }: ICampaignDetailsRequestParams,
  options: ApiRequestOptions = {},
): Promise<ICampaignDetails> => {
  const config: ApiRequestConfig = {
    params: { optionIndex },
    silentError: options.silentError,
  };

  const { data } = await $api.get<ICampaignDetailsResponse>(
    `/admin/campaigns/${status}/${campaignId}`,
    config,
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

export const deleteProposalOption = async ({
  campaignId,
  optionIndex,
}: IDeleteProposalOptionParams): Promise<void> => {
  // A missing index would delete the entire campaign. Zero is a valid index.
  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    throw new Error("A valid proposal option index is required.");
  }

  await $api.delete<void>(
    `/proposal-system/${encodeURIComponent(campaignId)}`,
    { params: { optionIndex } },
  );
};

export const approveProposalOption = async ({
  campaignId,
  optionIndex,
}: IApproveProposalOptionParams): Promise<
  IApproveProposalOptionResponse["data"]
> => {
  const { data } = await $api.post<IApproveProposalOptionResponse>(
    `/admin/campaigns/proposal/${encodeURIComponent(campaignId)}/approve`,
    undefined,
    {
      params: { optionIndex },
    },
  );

  return data.data;
};

export const closeCampaign = async (
  campaignId: string,
): Promise<void> => {
  await $api.post<void>(
    `/admin/campaigns/${encodeURIComponent(campaignId)}/close`,
  );
};

export const reopenCampaign = async (
  campaignId: string,
): Promise<void> => {
  await $api.post<void>(
    `/admin/campaigns/${encodeURIComponent(campaignId)}/reopen`,
  );
};

export const downloadCampaignPdf = async (
  campaignId: string,
): Promise<Blob> => {
  const { data } = await $api.get<Blob>(
    `/campaigns/${encodeURIComponent(campaignId)}/pdf`,
    {
      responseType: "blob",
      timeout: 15_000,
    },
  );

  return data;
};

export const sendCampaignWhatsAppOne = async (
  body: ISendCampaignWhatsAppRequest,
  options: ApiRequestOptions = {},
): Promise<ISendCampaignWhatsAppResponse> => {
  const config: ApiRequestConfig = {
    silentError: options.silentError,
  };

  const { data } = await $api.post<ISendCampaignWhatsAppResponse>(
    "/admin/campaigns/whatsapp/one",
    body,
    config,
  );

  return data;
};


export const sendCampaignEmail = async ({
  campaignId,
  promoId,
}: ISendCampaignEmailRequest): Promise<void> => {
  await $api.post<void>(
    `/admin/campaigns/mail/${encodeURIComponent(campaignId)}/${encodeURIComponent(promoId)}`,
  );
};


export const updateCampaignInsights = async (
  body: Pick<ICampaignDetails, "campaignId" | "campaignName">,
  options: ApiRequestOptions = {},
): Promise<void> => {
  const config: ApiRequestConfig = {
    silentError: options.silentError,
    timeout: 0,
  };

  await $api.patch(
    "/scrapers/post-details/all",
    body,
    config,
  );
};

