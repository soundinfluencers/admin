import equal from "fast-deep-equal";

import type {
  TCampaignManagementDraft,
  TCampaignManagementState,
} from "./campaign-management-store.types";

export const isSameCampaignContext = (
  first: TCampaignManagementDraft["params"],
  second: TCampaignManagementDraft["params"],
): boolean =>
  first.campaignId === second.campaignId &&
  first.status === second.status &&
  first.optionIndex === second.optionIndex;

const getEditableCampaignSnapshot = (
  snapshot: TCampaignManagementDraft,
) => {
  const { campaign, params } = snapshot;
  
  if (params.status === "completed") return null;

  return {
    campaignName: campaign.campaignName,
    price: campaign.price,
    displayCurrency: campaign.displayCurrency,

    ...(params.status !== "proposal" && {
      isPriceHidden: campaign.isPriceHidden,
      isCpmAndResultHidden: campaign.isCpmAndResultHidden,
    }),

    addedAccounts: (campaign.addedAccounts ?? []).map((account) => ({
      addedAccountsId: account.addedAccountsId || undefined,
      bundleId: account.bundleId || undefined,
      campaignBundleId: account.campaignBundleId || undefined,

      socialAccountId: account.socialAccountId,
      influencerId: account.influencerId,
      socialMedia: account.socialMedia,
      username: account.username,
      dateRequest: account.dateRequest,

      selectedContent: {
        campaignContentItemId:
          account.selectedContent?.campaignContentItemId || undefined,
        descriptionId:
          account.selectedContent?.descriptionId || undefined,
        additionalBriefId:
          account.selectedContent?.additionalBriefId || undefined,
      },

      ...(params.status === "distributing" && {
        postLink: account.postLink ?? "",
        screenshot: account.screenshot ?? "",
        impressions: account.impressions ?? undefined,
        like: account.like ?? undefined,
        comments: account.comments ?? undefined,
        shares: account.shares ?? undefined,
        saves: account.saves ?? undefined,
        rating: account.rating ?? undefined,
      }),
    })),

    campaignContent: (campaign.campaignContent ?? []).map((content) => ({
      _id: content._id,
      socialMedia: content.socialMedia,
      profileType: content.profileType ?? undefined,
      socialMediaGroup: content.socialMediaGroup,
      mainLink: content.mainLink,

      descriptions: (content.descriptions ?? []).map((item) => ({
        _id: item._id,
        description: item.description,
      })),

      taggedUser: content.taggedUser ?? "",
      taggedLink: content.taggedLink ?? "",

      additionalBrief: (content.additionalBrief ?? []).map((item) => ({
        _id: item._id,
        additionalBrief: item.additionalBrief,
      })),
    })),
  };
};

export const selectCampaignHasBaseline = (
  state: TCampaignManagementState,
): boolean =>
  state.draft !== null &&
  state.baseline !== null &&
  isSameCampaignContext(state.draft.params, state.baseline.params);

export const selectCampaignIsDirty = (
  state: TCampaignManagementState,
): boolean => {
  if (!state.draft) return false;
  
  if (
    !state.baseline ||
    !isSameCampaignContext(state.draft.params, state.baseline.params)
  ) {
    return true;
  }

  return !equal(
    getEditableCampaignSnapshot(state.baseline),
    getEditableCampaignSnapshot(state.draft),
  );
};
