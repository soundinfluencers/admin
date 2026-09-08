import type {
    CampaignCurrencyOption,
} from "@/entities/admin-create-campaign/campaign-filter/model/campaign-filter.types";
import type {
    PromoAccountPrices,
} from "@/entities/admin-create-campaign/promo-accounts/model/promo-account.types";

export type SelectedCampaignContentRef = {
    campaignContentItemId: string;
    descriptionId: string;
    additionalBriefId?: string;
};

export type SelectedCampaignAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
    prices?: PromoAccountPrices;
    dateRequest?: string;
    selectedCampaignContentItem?: SelectedCampaignContentRef | null;
    profileType?: "creator" | "community";
    source?: "manual";
    genres?: Array<string>;
    countries?: Array<{
        country: string;
        percentage: number;
    }>;
};

export type CampaignContentDescription = {
    _id: string;
    description: string;
};

export type CampaignContentAdditionalBrief = {
    _id: string;
    additionalBrief: string;
};

export type CampaignContentItem = {
    _id: string;
    socialMedia: string;
    socialMediaGroup: "main" | "music" | "press";
    mainLink: string;
    descriptions: CampaignContentDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: CampaignContentAdditionalBrief[];
    accountId?: string;
    profileType?: "creator" | "community";
    mediaCache?: any;
};

export type CampaignBuilderState = {
    campaignName: string;
    selectedPromoCardIds: string[];
    selectedAccounts: SelectedCampaignAccount[];
    campaignContent: CampaignContentItem[];
    totalPrice: number;

    selectedCurrency: string;

    postContentDraft: Record<string, unknown> | null;
    blocksDraft: any[] | null;
};

export type CampaignBuilderActions = {
    setCampaignName: (value: string) => void;

    setSelectedPromoCardIds: (ids: string[]) => void;
    togglePromoCardId: (id: string) => void;
    togglePromoCard: (account: SelectedCampaignAccount) => void;
    setSelectedAccounts: (accounts: SelectedCampaignAccount[]) => void;
    upsertSelectedAccount: (account: SelectedCampaignAccount) => void;

    setSelectedCampaignContentItem: (
        accountId: string,
        selectedCampaignContentItem: SelectedCampaignContentRef,
    ) => void;
    setSelectedCurrency: (value: CampaignCurrencyOption) => void;
    setAccountDateRequest: (accountId: string, dateRequest: string) => void;

    setCampaignContent: (items: CampaignContentItem[]) => void;
    setPostContentDraft: (value: Record<string, unknown> | null) => void;
    setBlocksDraft: (value: any[] | null) => void;

    syncSelectedAccountsContent: (
        addedAccounts: Array<{
            socialAccountId: string;
            selectedCampaignContentItem?: {
                campaignContentItemId: string;
                descriptionId: string;
                additionalBriefId?: string;
            } | null;
            dateRequest?: string;
            profileType?: "creator" | "community";
        }>,
    ) => void;

    setTotalPrice: (value: number) => void;
    reset: () => void;
};

export type CampaignBuilderStore = CampaignBuilderState & {
    actions: CampaignBuilderActions;
};
