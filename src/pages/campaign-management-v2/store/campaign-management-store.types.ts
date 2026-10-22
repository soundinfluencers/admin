import type {
  ICampaignDetails,
  ICampaignDetailsRequestParams,
  IMarkPromoPaidResponse,
  TEditableField,
} from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";
import type { TCampaignWhatsAppAccountUpdate } from "@/entities/campaign/model/campaign-whatsapp.types.ts";

export type TCampaignManagementDraft = {
  params: ICampaignDetailsRequestParams;
  campaign: ICampaignDetails;
};

export type TCampaignManagementMeta = {
  updatedAt: number | null;
  expiresAt: number | null;
};

export type TCampaignManagementState = {
  baseline: TCampaignManagementDraft | null;
  draft: TCampaignManagementDraft | null;
  meta: TCampaignManagementMeta;
};

export type TCampaignManagementActions = {
  initializeDraft: (draft: TCampaignManagementDraft) => void;
  resetDraft: () => void;
  restoreBaseline: () => void;
  applySavedCampaign: (params: ICampaignDetailsRequestParams, campaign: ICampaignDetails, submittedCampaign?: ICampaignDetails) => void;

  updateCampaignName: (name: string) => void;
  setPriceHidden: (hidden: boolean) => void;
  setCpmAndResultHidden: (hidden: boolean) => void;
  setCampaignPrice: (price: number) => void;
  setDisplayCurrency: (currency: TCurrency) => void;
  setAccountSelectedContent: (addedAccountsId: string, campaignContentItemId: string) => void;
  createContentForAccount: (addedAccountsId: string, mainLink: string) => void;
  setAccountSelectedDescription: (addedAccountsId: string, descriptionId: string) => void;
  setAccountSelectedBrief: (addedAccountsId: string, additionalBriefId: string) => void;
  createDescriptionForAccount: (addedAccountsId: string, text: string) => void;
  createBriefForAccount: (addedAccountsId: string, text: string) => void;
  updateContentDescription: (campaignContentItemId: string, descriptionId: string, text: string) => void;
  updateContentBrief: (campaignContentItemId: string, additionalBriefId: string, text: string) => void;
  deleteContentDescription: (campaignContentItemId: string, descriptionId: string) => void;
  deleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => void;
  updateContentTaggedUser: (campaignContentItemId: string, taggedUser: string) => void;
  updateContentTaggedLink: (campaignContentItemId: string, taggedLink: string) => void;
  setAccountDateRequest: (addedAccountsId: string, dateRequest: string) => void;
  setAccountPostLink: (addedAccountsId: string, postLink: string) => void;
  setAccountScreenshot: (addedAccountsId: string, screenshot: string) => void;
  setAccountMetricField: (addedAccountsId: string, field: TEditableField, value: number) => void;
  applyPromoPaid: (result: IMarkPromoPaidResponse["data"]) => void;
  applyWhatsAppUpdates: (params: ICampaignDetailsRequestParams, updates: readonly TCampaignWhatsAppAccountUpdate[]) => void;
  deleteCampaignContent: (campaignContentItemId: string) => void;
  removeAccount: (addedAccountsId: string) => void;
};

export type TCampaignManagementStore = TCampaignManagementState & TCampaignManagementActions;
