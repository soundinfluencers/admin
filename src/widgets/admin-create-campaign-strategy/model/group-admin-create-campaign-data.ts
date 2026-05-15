import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.types";

const normalizeSocial = (value?: string) => String(value || "").toLowerCase();

const MAIN_SOCIALS = ["instagram", "tiktok", "youtube", "facebook"];
const MUSIC_SOCIALS = ["spotify", "soundcloud"];

const isMainSocial = (socialMedia?: string) =>
    MAIN_SOCIALS.includes(normalizeSocial(socialMedia));

const isMusicSocial = (socialMedia?: string) =>
    MUSIC_SOCIALS.includes(normalizeSocial(socialMedia));

const isPressSocial = (socialMedia?: string) =>
    !isMainSocial(socialMedia) && !isMusicSocial(socialMedia);

const isCreatorMain = (account: SelectedCampaignAccount) =>
    ["instagram", "tiktok"].includes(normalizeSocial(account.socialMedia)) &&
    account.profileType === "creator";

const isCommunityMain = (account: SelectedCampaignAccount) =>
    ["instagram", "tiktok"].includes(normalizeSocial(account.socialMedia)) &&
    account.profileType === "community";

const isOtherMain = (account: SelectedCampaignAccount) =>
    isMainSocial(account.socialMedia) &&
    !["instagram", "tiktok"].includes(normalizeSocial(account.socialMedia));

type StrategyGroupedResult = {
    mainCreator: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    mainCommunity: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    mainOther: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    music: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    press: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
};

export const groupAdminCreateCampaignData = ({
                                                 accounts,
                                                 items,
                                             }: {
    accounts: SelectedCampaignAccount[];
    items: CampaignContentItem[];
}): StrategyGroupedResult => {
    const mainCreatorAccounts = accounts.filter(isCreatorMain);
    const mainCommunityAccounts = accounts.filter(isCommunityMain);
    const mainOtherAccounts = accounts.filter(isOtherMain);

    const musicAccounts = accounts.filter((account) =>
        isMusicSocial(account.socialMedia),
    );

    const pressAccounts = accounts.filter((account) =>
        isPressSocial(account.socialMedia),
    );

    const mainCreatorItems = items.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            ["instagram", "tiktok"].includes(normalizeSocial(item.socialMedia)) &&
            item.profileType === "creator",
    );

    const mainCommunityItems = items.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            ["instagram", "tiktok"].includes(normalizeSocial(item.socialMedia)) &&
            item.profileType === "community",
    );

    const mainOtherItems = items.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            ["youtube", "facebook"].includes(normalizeSocial(item.socialMedia)),
    );

    const musicItems = items.filter((item) => item.socialMediaGroup === "music");
    const pressItems = items.filter((item) => item.socialMediaGroup === "press");

    return {
        mainCreator: {
            title: "Video Distribution — Creators",
            accounts: mainCreatorAccounts,
            items: mainCreatorItems,
        },
        mainCommunity: {
            title: "Video Distribution — Communities",
            accounts: mainCommunityAccounts,
            items: mainCommunityItems,
        },
        mainOther: {
            title: "Video Distribution — Other Platforms",
            accounts: mainOtherAccounts,
            items: mainOtherItems,
        },
        music: {
            title: "Music Placements",
            accounts: musicAccounts,
            items: musicItems,
        },
        press: {
            title: "Press Coverage",
            accounts: pressAccounts,
            items: pressItems,
        },
    };
};