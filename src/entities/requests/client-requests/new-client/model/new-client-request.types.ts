import type { TRequestType } from "@/entities/requests/model/requests.types.ts";
export type TAvailableActions = 'accept' | 'decline';

export interface INewClient {
  requestId: string;
  clientId: string;
  firstName: string;
  lastName: string;
  instagramUsername: string;
  email: string;
  phone: string;
  companyName: string;
  companyType: string;
  referralCode: string;
  availableActions: TAvailableActions[];
}

export interface INewClientRequestRequest {
  requestId: string;
  requestType: TRequestType;
}

export interface INewClientRequestResponse {
  statusCode: number;
  message: string;
  data: INewClient;
}

export interface IUpdateNewClientRequestStatusRequest {
  requestId: string;
  response: TAvailableActions;
}
