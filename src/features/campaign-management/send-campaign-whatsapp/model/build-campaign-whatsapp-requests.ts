import type {
  ICampaignDetails,
} from "@/entities/campaign/model/campaign-details.types";

import type {
  ISendCampaignWhatsAppRequest,
} from "@/entities/campaign/model/campaign-whatsapp.types";

import {
  buildCampaignWhatsAppMessageData,
  formatCampaignWhatsAppMessage,
  type CampaignWhatsAppMessageData,
} from "./campaign-whatsapp-message";

export interface CampaignWhatsAppPreview {
  data: CampaignWhatsAppMessageData;
  request: ISendCampaignWhatsAppRequest;
}

export const buildCampaignWhatsAppPreview = (
  campaignId: string,
  campaign: Pick<ICampaignDetails, "addedAccounts">,
  influencerId: string,
): CampaignWhatsAppPreview => {
  if (!influencerId?.trim()) {
    throw new Error("Influencer ID is missing");
  }

  const firstAccount = campaign.addedAccounts.find(
    (account) => account.influencerId === influencerId,
  );

  if (!firstAccount) {
    throw new Error(
      "No campaign placements found for this influencer",
    );
  }

  const data = buildCampaignWhatsAppMessageData(
    campaign,
    influencerId,
  );

  return {
    data,
    request: {
      campaignId,
      influencerId,
      accountId: firstAccount.socialAccountId,
      socialMedia: firstAccount.socialMedia,
      message: formatCampaignWhatsAppMessage(data),
    },
  };
};

export const buildCampaignWhatsAppRequests = (
  campaignId: string,
  campaign: Pick<ICampaignDetails, "addedAccounts">,
): ISendCampaignWhatsAppRequest[] => {
  const influencerIds = new Set(
    campaign.addedAccounts.map((account) => account.influencerId),
  );

  return Array.from(
    influencerIds,
    (influencerId) =>
      buildCampaignWhatsAppPreview(
        campaignId,
        campaign,
        influencerId,
      ).request,
  );
};
