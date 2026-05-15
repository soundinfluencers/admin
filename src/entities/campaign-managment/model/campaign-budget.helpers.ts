import type { EditableCampaign } from "@/entities/campaign-managment/store/campaign-management.store";

export const getAutoCampaignBudget = (campaign: EditableCampaign | null) => {
    if (!campaign) return 0;

    return (campaign.addedAccounts ?? []).reduce((sum, item) => {
        return sum + Number(item.publicPrice ?? 0);
    }, 0);
};

export const getCampaignBudget = (campaign: EditableCampaign | null) => {
    if (!campaign) return 0;

    if (campaign.isBudgetManual) {
        return Number(campaign.price ?? 0);
    }

    return getAutoCampaignBudget(campaign);
};