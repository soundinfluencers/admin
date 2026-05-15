export type TUserType = "client" | "influencer";

export type TRequestType =
  | "NEW_CLIENT_REQUEST"
  | "NEW_INFLUENCER_REQUEST"
  | "CAMPAIGN_REQUEST"
  | "BESPOKE_CAMPAIGN_REQUEST"
  | "PROPOSAL_CAMPAIGN_REQUEST"
  | "NEW_SOCIAL_ACCOUNT_REQUEST"
  | "PRICE_UPDATE_REQUEST";

export interface IRequest {
  requestId: string;
  requestType: TRequestType;
  date: string;
  firstName: string;
  userType: TUserType;
  isRequestClosed: boolean;
}

export interface IGetListRequestsRequest {
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
