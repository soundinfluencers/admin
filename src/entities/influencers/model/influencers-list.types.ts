import type { IInfluencer } from "@/entities/influencers/model/influencers.types.ts";
import type { ISocialAccount } from "@/entities/influencers/model/social-account.types.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

export type TInfluencersListRow =
  Pick<IInfluencer, 'influencerId' | 'firstName' | 'lastName' | 'email' | 'phone' | 'balance' | 'internalNote'>
  &
  Pick<ISocialAccount, 'accountId' | 'username' | 'socialMedia' | 'logoUrl' | 'followers' | 'profileLink' | 'publicPrice' | 'price' | 'currency' | 'isHidden'>
  &
  { initialPrice: number; costPerFollower: number };

export type TGetInfluencersListParams = {
  limit: number;
  page: number;
  search?: string;
  platform?: TSocialMediaValue;
};

export interface IInfluencersListPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: TInfluencersListRow[];
}

export interface IInfluencersListResponse {
  statusCode: number;
  message: string;
  data: IInfluencersListPayload;
}

// update influencer Social Account response for table list
export interface IUpdateSocialAccountListResponse {
  statusCode: number;
  message: string;
  data: TInfluencersListRow;
}

// upload XLSX
export interface UploadInfluencersListXlsxParams {
  file: File;
  socialMedia: TSocialMediaValue;
}

// scrapper influencer update
export interface IScrapperUpdateParams {
  socialMedia: TSocialMediaValue;
  clientId: string;
}
