import type {
  ICampaignDetails,
  IUpdateCampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types.ts";

export const mapCampaignToUpdateBody = (
  campaign: ICampaignDetails,
  status: IUpdateCampaignDetailsRequestParams["status"],
): IUpdateCampaignDetailsRequestParams["body"] => {
  if (
    !Array.isArray(campaign.addedAccounts) ||
    campaign.addedAccounts.length === 0
  ) {
    throw new Error(
      "Cannot save campaign without accounts.",
    );
  }

  if (
    !Array.isArray(campaign.campaignContent) ||
    campaign.campaignContent.length === 0
  ) {
    throw new Error(
      "Cannot save campaign without content.",
    );
  }

  return {
    campaignName: campaign.campaignName,
    campaignPrice: campaign.price,
    displayCurrency: campaign.displayCurrency ?? undefined,

    ...(status !== "proposal" && {
      isPriceHidden: campaign.isPriceHidden,
      isCpmAndResultHidden: campaign.isCpmAndResultHidden,
    }),

    addedAccounts: campaign.addedAccounts.map((account) => {
      const selectedContent = account.selectedContent;

      if (selectedContent == null) {
        throw new Error(
          `Cannot save account ${account.socialAccountId}: selected content data is missing.`,
        );
      }

      return {
        addedAccountsId: account.addedAccountsId || undefined,
        bundleId: account.bundleId || undefined,
        campaignBundleId: account.campaignBundleId || undefined,

        socialAccountId: account.socialAccountId,
        influencerId: account.influencerId,
        socialMedia: account.socialMedia,
        username: account.username,

        selectedCampaignContentItem: {
          campaignContentItemId:
            selectedContent.campaignContentItemId || undefined,
          descriptionId:
            selectedContent.descriptionId || undefined,
          additionalBriefId:
            selectedContent.additionalBriefId || undefined,
        },

        dateRequest: account.dateRequest,

        ...(status === "distributing" && {
          postLink:
            account.postLink === null ? "" : account.postLink,
          screenshot:
            account.screenshot === null ? "" : account.screenshot,

          impressions: account.impressions ?? undefined,
          like: account.like ?? undefined,
          comments: account.comments ?? undefined,
          shares: account.shares ?? undefined,
          saves: account.saves ?? undefined,
          rating: account.rating ?? undefined,
        }),
      };
    }),

    campaignContent: campaign.campaignContent.map((content) => ({
      _id: content._id,
      socialMedia: content.socialMedia,
      profileType: content.profileType ?? undefined,
      socialMediaGroup: content.socialMediaGroup,
      mainLink: content.mainLink,

      descriptions: content.descriptions?.map((item) => ({
        _id: item._id,
        description: item.description,
      })),

      taggedUser: content.taggedUser ?? undefined,
      taggedLink: content.taggedLink ?? undefined,

      additionalBrief: content.additionalBrief?.map((item) => ({
        _id: item._id,
        additionalBrief: item.additionalBrief,
      })),
    })),
  };
};
