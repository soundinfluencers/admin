import type { TSocialMedia } from "@/shared/types/types.ts";

export type TPaymentHistorySystemStatus = "in_process" | "done";

export type TPaymentHistoryAdminOverrideStatus = "paid";

export type TPaymentHistoryEffectiveStatus =
  | TPaymentHistorySystemStatus
  | TPaymentHistoryAdminOverrideStatus;

export interface IPaymentHistoryCampaign {
  campaignId: string;
  campaignName: string;
  campaignCreatedAt: string;
  campaignStatus: string;
}

export interface IPaymentHistoryAccount {
  accountId: string;
  influencerId: string;
  username: string;
  logoUrl?: string;
}

export interface IPaymentHistoryCell {
  campaignId: string;
  accountId: string;
  effectiveStatus: TPaymentHistoryEffectiveStatus;
  systemStatus: TPaymentHistorySystemStatus;
  adminOverrideStatus?: TPaymentHistoryAdminOverrideStatus;
  label?: string;
}

export interface IPaymentHistoryMeta {
  campaignsNextCursor?: string | null;
  accountsNextCursor?: string | null;
  campaignsCount?: number;
  accountsCount?: number;
}

export interface IPaymentHistoryMatrix {
  campaigns: IPaymentHistoryCampaign[];
  accounts: IPaymentHistoryAccount[];
  cells: IPaymentHistoryCell[];
  meta: IPaymentHistoryMeta;
}

export type TGetPaymentHistoryParams = {
  campaignsCursor?: string;
  campaignsTake?: number;
  accountsCursor?: string;
  accountsTake?: number;
  search?: string;
  socialMedia?: TSocialMedia;
  effectiveStatus?: TPaymentHistoryEffectiveStatus;
}

export interface IPaymentHistoryResponse {
  statusCode: number;
  message: string;
  data: IPaymentHistoryMatrix;
}
