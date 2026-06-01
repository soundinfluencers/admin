import type { IInfluencerHistoryDetailsTableRow } from "./influencer-history-details-table.types";
import type {
  ICampaignAction,
  IInvoiceAction,
  TInfluencerHistoryAction,
} from "@/entities/influencer-history/model/influencer-history-detail.types.ts";

const isInvoiceAction = (
  action: TInfluencerHistoryAction,
): action is IInvoiceAction => {
  return action.actionType === "invoice";
};

const isCampaignAction = (
  action: TInfluencerHistoryAction,
): action is ICampaignAction => {
  return action.actionType === "campaign";
};

export const mapInfluencerHistoryActionToTableRow = (
  action: TInfluencerHistoryAction,
): IInfluencerHistoryDetailsTableRow => {
  if (isInvoiceAction(action)) {
    return {
      actionId: action.actionId,
      actionType: action.actionType,
      dateAndTime: action.dateAndTime,

      username: null,
      socialMedia: null,

      isStillInCampaign: null,
      campaignName: null,
      campaignId: null,
      campaignStatus: null,
      reward: action.amount,
      paymentMethod: action.paymentMethod,
      statusLabel: null,

      currentBalance: action.currentBalance,
    };
  }

  if (isCampaignAction(action)) {
    return {
      actionId: action.actionId,
      actionType: action.actionType,
      dateAndTime: action.dateAndTime,

      username: action.username,
      socialMedia: action.socialMedia,

      isStillInCampaign: action.isStillInCampaign,
      campaignName: action.campaignName,
      campaignId: action.campaignId,
      campaignStatus: action.campaignStatus,
      reward: action.reward,
      paymentMethod: null,
      statusLabel: action.statusLabel,

      currentBalance: action.currentBalance,
    };
  }

  return assertNever(action);
};

export const mapInfluencerHistoryActionsToTableRows = (
  actions: TInfluencerHistoryAction[],
): IInfluencerHistoryDetailsTableRow[] => {
  return actions.map(mapInfluencerHistoryActionToTableRow);
};

const assertNever = (value: never): never => {
  throw new Error(`Unexpected action type: ${JSON.stringify(value)}`);
};
