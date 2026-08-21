import { $api } from "@/app/api/http.ts";
import type { CampaignStatus } from "@/entities/campaign-managment/model/campaign.managment.ts";

type UpdateCampaignProps = {
    status: CampaignStatus;
    campaignId: string;
    body: {
        campaignName: string;
        addedAccounts: Array<{
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
        campaignContent: Array<{
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
        isCpmAndResultHidden: boolean;
        isPriceHidden: boolean;
        displayCurrency: string;
    };
    optionIndex?: number;
};

export const updateCampaignByStatus = async ({
                                                 status,
                                                 campaignId,
                                                 body,
                                                 optionIndex,
                                             }: UpdateCampaignProps) => {
    const res = await $api.patch(
        `/admin/campaigns/${status}/${campaignId}`,
        body,
        {
            params: {
                optionIndex,
            },
        },
    );

    return res.data.data;
};
