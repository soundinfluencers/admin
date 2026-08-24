import type {
    AddAccountsCurrency,
    FilterItem,
    SocialAccountCard,
} from "./add-accounts.types";
import type {
    EditableAccount,
    EditableCampaignContentItem,
} from "@/entities/campaign-managment/store/campaign-management.store";
import { getGroupBySocial } from "@/entities/campaign-managment/model/campaign-management.helpers";

export const getSelectedSocialMedias = (selected: FilterItem[]) =>
    selected
        .filter((item) => item.group === "socialMedia")
        .map((item) => item.id);

export const buildFilterBody = ({
                                    selected,
                                    budget,
                                    filterMethod,
                                }: {
    selected: FilterItem[];
    budget: number;
    filterMethod: "and" | "or";
}) => {
    const socialMedias = selected
        .filter((item) => item.group === "socialMedia")
        .map((item) => item.id);

    const countries = selected
        .filter((item) => item.group === "countries")
        .flatMap((item) =>
            item.children?.length ? item.children.map((child) => child.id) : item.id,
        );

    const musicGenres = selected
        .filter((item) => item.group === "genres")
        .flatMap((item) => {
            const parent = item.id;
            if (item.children?.length) {
                return item.children.map((child) => `${parent} ${child.id}`.trim());
            }
            return [parent];
        });

    const profileTypes = selected
        .filter((item) => item.group === "profileType")
        .map((item) => item.id);

    const additionalTopics = selected
        .filter((item) => item.group === "addTopics")
        .map((item) => item.id);

    const musicCategories = selected
        .filter((item) => item.group === "musicCategories")
        .map((item) => item.id);

    const entertainmentCategories = selected
        .filter((item) => item.group === "entertainmentCategories")
        .map((item) => item.id);

    return {
        socialMedias,
        profileTypes,
        musicGenres,
        musicGenresFilterMethod: filterMethod,
        countries,
        additionalTopics,
        budget,
        musicCategories,
        entertainmentCategories,
    };
};

export const mapCardToEditableAccount = (
    card: SocialAccountCard,
): EditableAccount => ({
    addedAccountsId: card.accountId,
    socialAccountId: card.accountId,
    influencerId: card.influencerId,
    socialMedia: String(card.socialMedia ?? "").toLowerCase(),
    username: String(card.username ?? ""),
    logoUrl: card.logoUrl ?? null,
    publicPrice: Number(card.prices?.EUR ?? 0), // или нужная валюта
    followers: Number(card.followers ?? 0),
    genres: card.musicGenres ?? [],
    countries: card.countries ?? [],
    selectedCampaignContentItem: null,
    dateRequest: "ASAP",
});

export const calcSelectedTotal = (
    selectedCards: SocialAccountCard[],
    currency: AddAccountsCurrency,
) => {
    return selectedCards.reduce((sum, card) => {
        const price = Number(card.prices?.[currency] ?? 0);
        return sum + price;
    }, 0);
};

export const ensureContentForAccounts = ({
                                             accounts,
                                             campaignContent,
                                             addContentItem,
                                         }: {
    accounts: EditableAccount[];
    campaignContent: EditableCampaignContentItem[];
    addContentItem: (
        socialMedia: string,
        payload?: Partial<EditableCampaignContentItem>,
        inheritFromContentId?: string,
    ) => { contentId: string; firstDescriptionId: string };
}) => {
    const ensured = new Map<
        string,
        { contentId: string; firstDescriptionId: string }
    >();

    const bySocial = new Map<string, EditableCampaignContentItem>();
    const byGroup = new Map<string, EditableCampaignContentItem>();

    campaignContent.forEach((item) => {
        const sm = String(item.socialMedia ?? "").toLowerCase();
        const group = String(item.socialMediaGroup ?? "");

        if (sm && !bySocial.has(sm)) bySocial.set(sm, item);
        if (group && !byGroup.has(group)) byGroup.set(group, item);
    });

    accounts.forEach((account) => {
        const sm = String(account.socialMedia ?? "").toLowerCase();
        if (!sm || ensured.has(sm)) return;

        const group = getGroupBySocial(sm);
        const existing = bySocial.get(sm) ?? byGroup.get(group) ?? null;

        if (existing) {
            ensured.set(sm, {
                contentId: String(existing._id),
                firstDescriptionId: String(existing.descriptions?.[0]?._id ?? ""),
            });
            return;
        }

        const created = addContentItem(sm, {
            socialMedia: sm,
            socialMediaGroup: group,
            mainLink: "Paste here your link",
            taggedUser: "",
            taggedLink: "",
            additionalBrief: "",
            descriptions: [{
                _id: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
                description: "Change your description",
            }],
        });

        ensured.set(sm, created);
    });

    return ensured;
};