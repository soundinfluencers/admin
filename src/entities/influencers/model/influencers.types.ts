// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { TSocialAccountShort } from "@/entities/influencers/model/social-account.types.ts";

export interface IInfluencer {
  influencerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  balance: number;

  internalNote: string;
  currencyNote: string;
}

export interface IInfluencerDetails {
  firstName: string;
  lastName: string;
  logoUrl: string;
  email: string;
  phone: string;

  instagram: TSocialAccountShort[];
  tiktok: TSocialAccountShort[];
  youtube: TSocialAccountShort[];
  facebook: TSocialAccountShort[];
  spotify: TSocialAccountShort[];
  soundcloud: TSocialAccountShort[];
  press: TSocialAccountShort[];
}

export interface IInfluencerDetailsResponse {
  statusCode: number;
  message: string;
  data: IInfluencerDetails;
}

//update influencer (change base partial IInfluencer)
export interface IUpdateInfluencerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  balance?: number;
  internalNote?: string;
  currencyNote?: string;
}

export type TUpdateInfluencerParams = {
  influencerId: string;
  accountId?: string;
  dto: IUpdateInfluencerDto;
}

export interface IUpdateInfluencerResponse {
  statusCode: number;
  message: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;

    currencyNote: string;
  };
}
