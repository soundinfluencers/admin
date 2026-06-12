import type { TSocialMedia } from "@/shared/types/types.ts";

export type TCampaignStatus = 'proposal' | 'pending' | 'distributing' | 'completed';
export type TPaymentStatus = 'wait' | 'confirmed';
export type TViewCampaignMode = 'affiliate' | 'payments';

export interface ICampaign {
  campaignId: string;
  socialMedia: TSocialMedia;
  campaignName: string;
  creatorRole: 'admin' | 'client'; // check role
  creatorName?: string;
  creatorCompanyName?: string;
  followers: number;
  cost: number;
  salePrice: number;
  date: string;
  status: TCampaignStatus;
  statusLabel: string;
  reportSent: boolean;
  paymentStatus: TPaymentStatus;
  invoiceId: string;
  shortInvoiceNumber: number;
  notes: string;
  affiliatePartner: string;
  affiliateCommission: string;
  affiliatePaid: string;
}

export type TGetCampaignParams =
  | {
  limit: number;
  search: string;
  status?: TCampaignStatus;
  page?: never;
}
  | {
  limit: number;
  page: number;
  status?: TCampaignStatus;
  search?: never;
};

export interface ICampaignListPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: ICampaign[];
}

export interface ICampaignListResponse {
  statusCode: number;
  message: string;
  data: ICampaignListPayload;
}

// Update campaign
export interface IUpdateCampaignDto {
  reportSent?: boolean;
  notes?: string;
  affiliatePartner?: string;
  affiliateCommission?: string;
  affiliatePaid?: string;
}

export interface IUpdateCampaignParams {
  campaignId: string;
  status: TCampaignStatus;
  dto: IUpdateCampaignDto;
}

export interface IUpdateCampaignResponse {
  statusCode: number;
  message: string;
  data: IUpdateCampaignDto & { campaignId: string };
}

// Delete campaign
export interface IDeleteCampaignParams {
  campaignId: string;
  status: TCampaignStatus;
}
