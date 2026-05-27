export const ADMIN_REQUEST_TYPES = [
  'NEW_CLIENT_REQUEST',
  'NEW_INFLUENCER_REQUEST',
  'CAMPAIGN_REQUEST',
  'BESPOKE_CAMPAIGN_REQUEST',
  'PROPOSAL_CAMPAIGN_REQUEST',
  'NEW_SOCIAL_ACCOUNT_REQUEST',
  'PRICE_UPDATE_REQUEST',
] as const;

export type TRequestType = typeof ADMIN_REQUEST_TYPES[number];

export type TRequestSpecifiedStatus =
  | "WAITING_FOR_ADMIN"
  | "APPROVED"
  | "REJECTED";

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

export interface ICampaignRequestDetailsDto {
  requestId: string;
  group: TRequestFilterStatus;
  type: "CAMPAIGN_REQUEST";
  date: string;
  clientId: string;
  firstName: string;
  lastName: string;
  
}

//   "data": {
//     "requestId": "6a15b08194f617ea9e21bea2",
//     "group": "CAMPAIGN",
//     "type": "CAMPAIGN_REQUEST",
//     "date": "26.05.26",
//     "clientId": "66a747a89c6e78a6cffb83b4",
//     "firstName": "Eric",
//     "lastName": "Ericovich",
//     "email": "test@gmail.com",
//     "campaignName": "awddaw",
//     "paymentMethod": "bank_transfer_uk",
//     "items": [
//     {
//       "socialMedia": "instagram",
//       "mainLink": "awdawd",
//       "additionalBrief": "",
//       "descriptions": [
//         "awda"
//       ],
//       "accounts": [
//         "Techno Nation",
//         "No Sleep Techno",
//         "Techno Style",
//         "Rave Girls Official",
//         "Techno MOB",
//         "Techno TV",
//         "Traffic Mix",
//         "Techno Music World",
//         "Best Drops Ever",
//         "BPM Culture",
//         "Fiesta Techno",
//         "Techno Philosophy",
//         "Rave Is Here",
//         "Your Techno",
//         "Deep Tech House",
//         "Sound of House Music",
//         "Rave Tribes",
//         "Techno Of Insta",
//         "Techno is love",
//         "Music Appeal",
//         "Rave Residence",
//         "Track ID Blog",
//         "SUB:CULTURE"
//       ]
//     },

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
  category: string;
  campaignGoal: string;
  contentLink: string;
  budget: number;
  targetTerritories: string;
  extraBriefs: string;
}

export interface IAdminRequestDetailsByType {
  NEW_CLIENT_REQUEST: INewClientRequestDetailsDto;
  NEW_INFLUENCER_REQUEST: any;
  CAMPAIGN_REQUEST: any;
  BESPOKE_CAMPAIGN_REQUEST: IBespokeCampaignRequestDetailsDto;
  PROPOSAL_CAMPAIGN_REQUEST: any;
  NEW_SOCIAL_ACCOUNT_REQUEST: any;
  PRICE_UPDATE_REQUEST: any;
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
