import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

export interface IInfluencerHistory {
  influencerId: string;
  influencerName: string;
  socialMedia: TSocialMediaValue;
  username: string;
  campaignName: string;
  statusLabel: string;
}

export type TGetInfluencerHistoryParams = {
  limit: number;
};

export type TGetInfluencerSearchHistoryParams = {
  limit: number;
  search: string;
};

export interface IInfluencerHistoryResponse {
  statusCode: number;
  message: string;
  data: IInfluencerHistory[];
}

export interface IInfluencerSearchHistory {
  influencerId: string;
  accountId: string;
  socialMedia: TSocialMediaValue;
  username: string;
  logoUrl: string;
}

export interface IInfluencerSearchHistoryPayload {
  items: IInfluencerSearchHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IInfluencerSearchHistoryResponse {
  statusCode: number;
  message: string;
  data: IInfluencerSearchHistoryPayload;
}
