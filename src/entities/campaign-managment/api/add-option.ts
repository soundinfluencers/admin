import { $api } from "@/app/api/http.ts";

type AddAdminProposalOptionBody = {
    campaignName?: string;
    addedAccounts?: Array<{
        socialAccountId: string;
        influencerId: string;
        socialMedia: string;
        username: string;
        selectedCampaignContentItem: {
            campaignContentItemId: string;
            descriptionId: string;
            additionalBriefId?: string;
        } | null;
        dateRequest: string;
    }>;
    campaignContent?: Array<{
        _id: string;
        socialMedia: string;
        socialMediaGroup: string;
        mainLink: string;
        descriptions: Array<{
            _id: string;
            description: string;
        }>;
        taggedUser: string;
        taggedLink: string;
        additionalBrief: Array<{
            _id: string;
            additionalBrief: string;
        }>;
    }>;
};

export const addAdminProposalOption = async (
    campaignId: string,
    body: AddAdminProposalOptionBody,
) => {
    const res = await $api.post("/proposal-system", body, {
        params: { campaignId },
    });

    return res.data?.data ?? res.data;
};
