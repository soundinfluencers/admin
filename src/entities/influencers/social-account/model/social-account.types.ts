import type { TCurrency, TPlatform } from "@/shared/types/types.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

export type TProfileCategory = "community" | "creator";

export interface ISocialAccount {
  accountId: string;
  influencerId: string;
  socialMedia: TPlatform;
  username: string;
  profileLink: string;
  followers: number;
  logoUrl: string;
  price: number;
  publicPrice: number;
  initialPrice: number;
  currency: TCurrency;
  engagementRate: number;
  averageViews: number;

  communityMusicGenres?: string[];
  communityThemeTopics?: string[];
  creatorMusicGenres?: string[];
  creatorContentFocus?: string[];

  profileCategory: TProfileCategory;

  countries: {
    country: string;
    percentage: number;
  }[];

  isHidden: boolean;
}

export type TSocialAccountRequest = Omit<
  ISocialAccount,
  "accountId" | "socialMedia" | "influencerId" | "isHidden" | "publicPrice" | "initialPrice"
>;

export type TSocialAccountBaseDto = Omit<
  ISocialAccount,
  "accountId" | "socialMedia" | "influencerId" | "isHidden" | "publicPrice" | "price" | "initialPrice"
>;
export type TCreateSocialAccountDto = TSocialAccountBaseDto & Pick<ISocialAccount, "price">;
export type TUpdateSocialAccountDto = TSocialAccountBaseDto & Pick<
  ISocialAccount,
  "accountId" | "socialMedia" | "influencerId" | "price"
>;

export type TSocialAccountShort = {
  accountId: string;
  username: string;
};

export interface IGetSocialAccountRequest {
  influencerId: string;
  accountId: string;
  socialMedia: TPlatform;
}

export interface IGetSocialAccountResponse {
  statusCode: number;
  message: string;
  data: ISocialAccount;
}

export interface TCreateSocialAccountRequest {
  influencerId: string;
  socialMedia: TPlatform;
  dto: TCreateSocialAccountDto;
}

export interface IDeleteSocialAccountRequest {
  influencerId: string;
  accountId: string;
  socialMedia: TPlatform;
}

export interface IUpdateListSocialAccountDto {
  influencerId: string;
  accountId: string;
  socialMedia: TSocialMediaValue;

  profileLink?: string;
  publicPrice?: number;
  price?: number;
  isHidden?: boolean;
}
