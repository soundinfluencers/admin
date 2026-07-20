import type { TOfferGenre } from "@/features/influencers-offers/offers-filter-by-genres";
import type { TOfferSocialMedia } from "@/features/influencers-offers/offers-filter-by-platform";

export interface IOfferHeader {
  offerId: string;
  title: string;
  isPublished: boolean;
  offerPrice: number;
  costPrice: number;
  combinedFollowers: number;
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
  genre: TOfferGenre;

  offersCursor?: string;
  accountsCursor?: string;

  offersTake?: number;
  accountsTake?: number;
}

export interface ICreateInfluencersOfferRequest {
  socialMedia: TOfferSocialMedia;
  genre: TOfferGenre;
  offerName: string;
}

export interface IInfluencersOfferLinkRequest {
  offerId: string;
  influencerId: string;
  accountId: string;
  connected: boolean;
}

export interface IPublishInfluencersOffersRequest {
  socialMedia: TOfferSocialMedia;
  genre: TOfferGenre;
}

export interface IUpdateInfluencersOfferPriceRequest {
  offerId: string;
  field: "price";
  value: number;
}

export interface IDeleteInfluencersOfferRequest {
  offerId: string;
}

export interface IInfluencersOfferMutationResponse {
  statusCode: number;
  message: string;
}

export interface IAccount {
  accountId: string;
  influencerId: string;
  username: string;
  logoUrl: string;
  followers: number;
}

export interface IOffersClients {
  _id: string;
  title: string;
  socialMedia: TOfferSocialMedia;
  connectedAccounts: IAccount[];
  price: number;
  genre: TOfferGenre;
  combinedFollowers: number;
  networksAmount: string;
  storyAndPostDetails: string;
}

export interface IGetOffersClientsParams {
  socialMedia: TOfferSocialMedia;
  genre: TOfferGenre;
}

export interface IGetOffersClientsResponse {
  statusCode: number;
  message: string;
  data: IOffersClients[];
}
