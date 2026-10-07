import type {
  ICampaignDetails,
  ICreateProposalOptionRequestParams,
} from "@/entities/campaign/model/campaign-details.types.ts";

export const mapCampaignToProposalOptionBody = (
  campaign: ICampaignDetails,
): ICreateProposalOptionRequestParams["body"] => {
  if (
    !Array.isArray(campaign.addedAccounts) ||
    !Array.isArray(campaign.campaignContent)
  ) {
    throw new Error(
      "Cannot copy option: accounts or campaign content are missing.",
    );
  }

  return {
    campaignName: campaign.campaignName,
    socialMedia: campaign.socialMedia,
    campaignPrice: campaign.price,
    displayCurrency: campaign.displayCurrency ?? undefined,

    addedAccounts: campaign.addedAccounts.map((account) => {
      const selectedContent = account.selectedContent;

      if (selectedContent == null) {
        throw new Error(
          `Cannot copy option: selected content is missing for account ${account.socialAccountId}.`,
        );
      }

      return {
        addedAccountsId: account.addedAccountsId ?? undefined,
        bundleId: account.bundleId ?? undefined,
        socialAccountId: account.socialAccountId,
        influencerId: account.influencerId,
        socialMedia: account.socialMedia,
        username: account.username,

        selectedCampaignContentItem: {
          campaignContentItemId:
            selectedContent.campaignContentItemId ?? undefined,
          descriptionId: selectedContent.descriptionId ?? undefined,
          additionalBriefId:
            selectedContent.additionalBriefId ?? undefined,
        },

        dateRequest: account.dateRequest,
      };
    }),

    campaignContent: campaign.campaignContent.map((content) => {
      if (!Array.isArray(content.descriptions)) {
        throw new Error(
          `Cannot copy option: descriptions are missing for content ${content._id}.`,
        );
      }

      return {
        _id: content._id,
        socialMedia: content.socialMedia,
        profileType: content.profileType ?? undefined,
        socialMediaGroup: content.socialMediaGroup,
        mainLink: content.mainLink,

        descriptions: content.descriptions.map((item) => ({
          _id: item._id,
          description: item.description,
        })),

        taggedUser: content.taggedUser ?? undefined,
        taggedLink: content.taggedLink ?? undefined,

        additionalBrief: content.additionalBrief?.map((item) => ({
          _id: item._id,
          additionalBrief: item.additionalBrief,
        })),
      };
    }),
  };
};
