import type { TCurrency, TSocialMedia } from "@/shared/types/types.ts";
import type { ISocialAccount } from "@/entities/influencers/social-account/model/social-account.types.ts";


export const ADMIN_REQUEST_TYPES = [
  'NEW_CLIENT_REQUEST',
  'NEW_INFLUENCER_REQUEST',
  'CAMPAIGN_REQUEST',
  'BESPOKE_CAMPAIGN_REQUEST',
  'NEW_SOCIAL_ACCOUNT_REQUEST',
  'PRICE_UPDATE_REQUEST',
] as const;

export type TRequestType = typeof ADMIN_REQUEST_TYPES[number];

export type TRequestSpecifiedStatus =
  | "WAITING_FOR_ADMIN"
  | "APPROVED"
  | "REJECTED"
  | "NEGOTIATION";

export type TRequestFilterStatus = "CLIENT" | "INFLUENCER" | "CAMPAIGN" | "PRICING";
export type TRequestLifecycleStatus = "OPEN" | "CLOSED";
export type TResponse = "APPROVE" | "REJECT";

export interface IRequest {
  requestId: string;
  label: string;
  submittedBy: string;
  date: string;
  group: TRequestFilterStatus;
  type: TRequestType;
  lifecycleStatus: TRequestLifecycleStatus;
  specifiedStatus: TRequestSpecifiedStatus;
  unreadMessages?: number;
}

export interface IGetListRequestsParams {
  state: TRequestLifecycleStatus;
  group?: TRequestFilterStatus;
  limit: number;
  page: number;
  search?: string;
}

interface IRequestListPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: IRequest[];
}

export interface IGetListRequestsResponse {
  statusCode: number;
  message: string;
  data: IRequestListPayload;
}

//DETAILS REQUESTS

//New client request details
export interface INewClientRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "NEW_CLIENT_REQUEST";
  date: string;
  clientId: string;
  firstName: string;
  lastName: string;
  instagramUsername: string;
  email: string;
  phone: string;
  companyName: string;
  companyType: string;
  referralCode: string;
}

//Campaign request details
export type TCampaignPaymentMethod =
  | "bank_card"
  | "paypal"
  | "bank_transfer_uk"
  | "bank_transfer_eu"
  | "bank_transfer_international";

export interface ICampaignItem {
  socialMedia: Exclude<TSocialMedia, 'multipromo'>;
  mainLink: string;
  additionalBrief: string;
  descriptions: string[];
  accounts: string[];
}

export interface ICampaignRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "CAMPAIGN_REQUEST";
  date: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  campaignName: string;
  paymentMethod: TCampaignPaymentMethod;
  items: ICampaignItem[];
}

// Bespoke campaign request
export interface IBespokeCampaignRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "BESPOKE_CAMPAIGN_REQUEST";
  date: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  category: "artist" | "music" | "event" | "other";
  currency: TCurrency;
  campaignGoal: string;
  contentLink: string;
  budget: number;
  targetTerritories: string;
  extraBriefs: string;
  trackLink: string;
  releaseDate: string;
  smartLink: string;
  ticketLink: string;
}

// Change pric request
export interface IPriceUpdateRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "PRICE_UPDATE_REQUEST";
  date: string;
  influencerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountId: string;
  username: string;
  profileLink: string;
  socialMedia: Exclude<TSocialMedia, 'multipromo'>;
  currentPrice: number;
  currentCurrency: TCurrency;
  newPrice: number;
  newCurrency: TCurrency;
}

// New influencer request
export type TInfluencerAccount = Omit<ISocialAccount,
  | "influencerId"
  | "isHidden"
  | "engagementRate"
  | "averageViews"
  | "publicPrice"
>

export interface INewInfluencerRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "NEW_INFLUENCER_REQUEST";
  date: string;
  influencerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accounts: TInfluencerAccount[];
}

// New social account request
export interface INewInfluencerAccountRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "NEW_SOCIAL_ACCOUNT_REQUEST";
  date: string;
  influencerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountDetails: TInfluencerAccount;
}

export interface IAdminRequestDetailsByType {
  NEW_CLIENT_REQUEST: INewClientRequestDetailsDto;
  NEW_INFLUENCER_REQUEST: INewInfluencerRequestDetailsDto;
  CAMPAIGN_REQUEST: ICampaignRequestDetailsDto;
  BESPOKE_CAMPAIGN_REQUEST: IBespokeCampaignRequestDetailsDto;
  // PROPOSAL_CAMPAIGN_REQUEST: any;
  NEW_SOCIAL_ACCOUNT_REQUEST: INewInfluencerAccountRequestDetailsDto;
  PRICE_UPDATE_REQUEST: IPriceUpdateRequestDetailsDto;
}

export type TAdminRequestDetails =
  {
    [K in TRequestType]: IAdminRequestDetailsByType[K] & {
    type: K;
  };
  }[TRequestType];

export interface IGetAdminRequestDetailsParams<T extends TRequestType = TRequestType> {
  requestId: string;
  requestType: T;
}

export interface IGetRequestDetailsResponse<T extends TRequestType = TRequestType> {
  statusCode: number;
  message: string;
  data: IAdminRequestDetailsByType[T];
}

export interface IUpdateRequestStatusParams {
  requestId: string;
  response: TResponse;
}
