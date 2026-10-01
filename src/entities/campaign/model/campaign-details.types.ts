import type { TSocialMedia } from "@/shared/constants/social-media-taxonomy.ts";
import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";

export const CAMPAIGN_STATUSES = {
  UNDER_REVIEW: 'under_review',
  DISTRIBUTING: 'distributing',
  COMPLETED: 'completed',
  PROPOSAL: 'proposal',
  PENDING: 'pending',
} as const;

export type TCampaignStatus = (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES];

export const CAMPAIGN_STATUS_LABELS = {
  [CAMPAIGN_STATUSES.UNDER_REVIEW]: 'Under Review',
  [CAMPAIGN_STATUSES.DISTRIBUTING]: 'Distributing',
  [CAMPAIGN_STATUSES.COMPLETED]: 'Completed',
  [CAMPAIGN_STATUSES.PROPOSAL]: 'Proposal',
  [CAMPAIGN_STATUSES.PENDING]: 'Pending',
} satisfies Record<TCampaignStatus, string>;

export const WHATSAPP_STATUS = {
  SENT: "sent",
  NOT_SENT: "not_sent",
  FAILED: "failed",
} as const;

export type TWhatsAppStatus = (typeof WHATSAPP_STATUS)[keyof typeof WHATSAPP_STATUS];

export const WHATSAPP_STATUS_LABELS = {
  [WHATSAPP_STATUS.SENT]: 'Sent',
  [WHATSAPP_STATUS.NOT_SENT]: 'Not Sent',
  [WHATSAPP_STATUS.FAILED]: 'Failed',
} satisfies Record<TWhatsAppStatus, string>;

interface ISelectedContent {
  campaignContentItemId: string;
  descriptionId: string;
  additionalBriefId: string;
}

interface ISelectedContentItem {
  _id: string;
  socialMedia: TSocialMedia;
  socialMediaGroup: string;
  mainLink: string;
  description: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
}

interface IAccountCountry {
  _id: string;
  country: string;
  percentage: number;
}

export interface IAddedAccount {
  addedAccountsId: string;
  socialAccountId: string;
  influencerId: string;
  bundleId: string;
  campaignBundleId: string;
  bundlePosition: number;
  socialMedia: TSocialMedia;
  username: string;
  publicPrice: number;
  followers: number;
  selectedContent: ISelectedContent;
  selectedContentItem: ISelectedContentItem;
  confirmation: "accept" | "wait";
  closePromo: "close" | "wait";
  dateRequest: string;
  datePost: string | null;
  postLink: string | null;
  screenshot: string | null;
  impressions: number;
  like: number;
  comments: number;
  shares: number;
  saves: number;
  rating: number;
  genres: string[]; //TODO: check backend contracts
  countries: IAccountCountry[];
  logoUrl: string;
  profileType: "community" | "creator";
  whatsappStatus: TWhatsAppStatus;
  whatsappLastAttemptAt: string;
  price: number;
  initialPrice: number;
  currency: TCurrency;
  firstName: string;
  phoneNumber: string;
  statusLabel: string;
  cpm: number | undefined;
}

interface IAddedBundle {
  campaignBundleId: string;
  bundleId: string;
  influencerId: string;
  acceptancePolicy: "all_or_nothing" | "selective";
  influencerReward: number;
  originalInfluencerReward: number;
  clientPrice: number;
  originalClientPrice: number;
  pricingStrategy: "proportional";
  currency: TCurrency;
  snapshotAt: string;
  rewardStatus: "pending" | "credited";
}

interface IAddedOffer {
  campaignOfferId: string;
  offerId: string;
  selectedAccountIds: string[];
  selectedAddedAccountsIds: string[];
  overlapAccountIds: string[];
  title: string;
  socialMedia: TSocialMedia;
  genre: string; //TODO: check backend contract
  clientPrice: number;
  originalClientPrice: number;
  currency: TCurrency;
  snapshotAt: string;
}

interface ICampaignContent {
  _id: string;
  socialMedia: TSocialMedia;
  profileType: "community" | "creator";
  socialMediaGroup: string;
  mainLink: string;
  descriptions: {
    _id: string;
    description: string;
  }[];
  taggedUser: string;
  taggedLink: string;
  additionalBrief: {
    _id: string;
    additionalBrief: string;
  }[];
  mediaCache: unknown; //TODO: check backend contract
}

export interface ICampaignDetails {
  campaignId: string;
  campaignName: string;
  socialMedia: TSocialMedia;
  creationDate: string;
  price: number;
  displayCurrency: TCurrency;
  pricesByCurrency: Record<TCurrency, number>;
  status: TCampaignStatus;
  addedAccounts: IAddedAccount[];
  addedBundles: IAddedBundle[];
  selectedOffer: IAddedOffer;
  campaignContent: ICampaignContent[];
  shareLink: string;
  totalFollowers: number;
  totalImpressions: number;
  totalLikes: number;
  totalSaves: number;
  totalComments: number;
  totalShares: number;
  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;
  hiddenColumns: string[];
  cpm: number;
  canEdit: boolean;
  internalCost: number;
  existingOptions: number[];
}

export interface ICampaignDetailsRequestParams {
  campaignId: string;
  status: TCampaignStatus;
  optionIndex?: number;
}

export interface ICampaignDetailsResponse {
  statusCode: number;
  message: string;
  data: ICampaignDetails;
}
