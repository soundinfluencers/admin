import type { TPlatform } from "@/features/influencers-offers/filter-offers-by-platforms/model/platform.config.ts";
import type { TGenres } from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";

export interface IOfferHeader {
  offerId: string;
  title: string;
  isPublished: boolean;
  price: number;
  createdAt: string;
}

export interface IOfferAccountRow {
  influencerId: string;
  accountId: string;
  username: string;
  logoUrl: string | null;
}

export interface IOfferLink {
  offerId: string;
  influencerId: string;
  accountId: string;
}

export interface IInfluencersOffersMatrix {
  offerHeaders: IOfferHeader[];
  accountRows: IOfferAccountRow[];
  links: IOfferLink[];
  offersNextCursor: string | null;
  accountsNextCursor: string | null;
}

export interface IInfluencersOffersMatrixResponse {
  statusCode: string;
  message: string;
  data: IInfluencersOffersMatrix;
}

export interface IGetInfluencersOffersMatrixParams {
  socialMedia: TPlatform;
  genre: TGenres;

  offersCursor?: string;
  accountsCursor?: string;

  offersTake?: number;
  accountsTake?: number;
}

export interface IOfferPublishedRequest {
  offerId: string;
}

export interface IOfferPublishedResponse {
  statusCode: number;
  message: string;
}

export interface IOfferAccountLinkRequest {
  offerId: string;
  influencerId: string;
  accountId: string;
  connected: boolean;
}

export interface IOfferAccountLinkResponse {
  statusCode: number;
  message: string;
}

export interface IDeleteOfferRequest {
  offerId: string;
}

export interface IDeleteOfferResponse {
  statusCode: number;
  message: string;
}
