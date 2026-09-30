import type {
  ICampaignDetails,
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";

export type TCampaignManagementDraft = {
  params: ICampaignDetailsRequestParams;
  campaign: ICampaignDetails;
};

export type TCampaignManagementMeta = {
  updatedAt: number | null;
  expiresAt: number | null;
};

export type TCampaignManagementState = {
  draft: TCampaignManagementDraft | null;
  meta: TCampaignManagementMeta;
};

export type TCampaignManagementActions = {
  initializeDraft: (draft: TCampaignManagementDraft) => void;
  resetDraft: () => void;
  
  updateCampaignName: (name: string) => void;
  setPriceHidden: (hidden: boolean) => void;
  setCpmAndResultHidden: (hidden: boolean) => void;
  setCampaignPrice: (price: number) => void;
  setDisplayCurrency: (currency: TCurrency) => void;
  setAccountSelectedContent: (socialAccountId: string, campaignContentItemId: string) => void;
  createContentForAccount: (socialAccountId: string, mainLink: string) => void;
  setAccountSelectedDescription: (socialAccountId: string, descriptionId: string) => void;
  setAccountSelectedBrief: (socialAccountId: string, additionalBriefId: string) => void;
  createDescriptionForAccount: (socialAccountId: string, text: string) => void;
  createBriefForAccount: (socialAccountId: string, text: string) => void;
  updateContentDescription: (campaignContentItemId: string, descriptionId: string, text: string) => void;
  updateContentBrief: (campaignContentItemId: string, additionalBriefId: string, text: string) => void;
  deleteContentDescription: (campaignContentItemId: string, descriptionId: string) => void;
  deleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => void;
  updateContentTaggedUser: (campaignContentItemId: string, taggedUser: string) => void;
  updateContentTaggedLink: (campaignContentItemId: string, taggedLink: string) => void;
  setAccountDateRequest: (socialAccountId: string, dateRequest: string) => void;
  deleteCampaignContent: (campaignContentItemId: string) => void;
  removeAccount: (socialAccountId: string) => void;
};

export type TCampaignManagementStore = TCampaignManagementState & TCampaignManagementActions;
