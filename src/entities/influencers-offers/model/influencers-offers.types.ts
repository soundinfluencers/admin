import type { TOfferMusicGenre } from "@/features/influencers-offers/offers-filter-by-genres";
import type { TOfferSocialMedia } from "@/features/influencers-offers/offers-filter-by-platform";

export interface IOfferHeader {
  offerId: string;
  title: string;
  isPublished: boolean;
  offerPrice: number;
  costPrice: number;
  createdAt: string;
}

export interface IOfferAccountRow {
  influencerId: string;
  accountId: string;
  username: string;
  followers: number;
  price: number;
  pricePerFollower: number;
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
  statusCode: number;
  message: string;
  data: IInfluencersOffersMatrix;
}

export interface IGetInfluencersOffersMatrixParams {
  socialMedia: TOfferSocialMedia;
  genre: TOfferMusicGenre;

  offersCursor?: string;
  accountsCursor?: string;

  offersTake?: number;
  accountsTake?: number;
}

export interface ICreateInfluencersOfferRequest {
  socialMedia: TOfferSocialMedia;
  genre: TOfferMusicGenre;
  offerName: string;
}

export interface IInfluencersOfferLinkRequest {
  offerId: string;
  influencerId: string;
  accountId: string;
  connected: boolean;
}

export interface IPublishInfluencersOfferRequest {
  offerId: string;
}

export interface IInfluencersOfferMutationResponse {
  statusCode: number;
  message: string;
}
