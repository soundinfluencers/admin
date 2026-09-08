
import { ObjectId } from "bson";
import type {
    CampaignContentAdditionalBrief,
    CampaignContentItem,
    SelectedCampaignAccount,
} from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.types";
import type {
    CampaignCurrencyCode,
} from "@/entities/admin-create-campaign/campaign-filter/model/campaign-filter.types";

type LegacyCampaignContentItem = Omit<CampaignContentItem, "additionalBrief"> & {
    additionalBrief?: CampaignContentAdditionalBrief[] | string | null;
};

type Params = {
    campaignName: string;
    totalPrice: number;
    displayCurrency: CampaignCurrencyCode;
    accounts: SelectedCampaignAccount[];
    content: LegacyCampaignContentItem[];
};

const resolveSocialMedia = (content: LegacyCampaignContentItem[]) => {
    const socials = Array.from(
        new Set(
            (content ?? [])
                .map((item) => String(item.socialMedia ?? "").trim().toLowerCase())
                .filter(Boolean),
        ),
    );

    if (socials.length === 0) return "instagram";
    if (socials.length === 1) return socials[0];

    return "multipromo";
};

const normalizeAdditionalBrief = (
    value: LegacyCampaignContentItem["additionalBrief"],
): CampaignContentAdditionalBrief[] => {
    if (Array.isArray(value)) {
        return value.map((brief) => ({
            _id: String(brief._id),
            additionalBrief: String(brief.additionalBrief),
        }));
    }

    const additionalBrief = String(value ?? "").trim();

    return additionalBrief
        ? [{ _id: new ObjectId().toHexString(), additionalBrief }]
        : [];
};

const validateCurrencyTotal = ({
                                   accounts,
                                   displayCurrency,
                                   totalPrice,
                               }: Pick<
    Params,
    "accounts" | "displayCurrency" | "totalPrice"
>) => {
    const expectedTotal = accounts.reduce((sum, account) => {
        const presetPrice = account.prices?.[displayCurrency];

        if (typeof presetPrice !== "number" || !Number.isFinite(presetPrice)) {
            throw new Error(
                `Missing ${displayCurrency} preset price for account ${account.accountId}`,
            );
        }

        if (account.price !== presetPrice) {
            throw new Error(
                `Campaign price is out of sync for account ${account.accountId}`,
            );
        }

        return sum + presetPrice;
    }, 0);

    if (!Number.isFinite(totalPrice) || totalPrice !== expectedTotal) {
        throw new Error("Campaign total is out of sync with selected currency");
    }
};

export const buildAdminCreateCampaignPayload = ({
                                                    campaignName,
                                                    totalPrice,
                                                 displayCurrency,
                                                 accounts,
                                                 content,
                                             }: Params) => {
    validateCurrencyTotal({ accounts, displayCurrency, totalPrice });

    const campaignContent = (content ?? []).map((item) => ({
        _id: String(item._id ?? ""),
        socialMedia: String(item.socialMedia ?? ""),
        profileType: item.profileType ?? undefined,
        socialMediaGroup: String(item.socialMediaGroup ?? ""),
        mainLink: String(item.mainLink ?? ""),
        descriptions: (item.descriptions ?? []).map((description) => ({
            _id: String(description._id ?? ""),
            description: String(description.description ?? ""),
        })),
        taggedUser: String(item.taggedUser ?? ""),
        taggedLink: String(item.taggedLink ?? ""),
        additionalBrief: normalizeAdditionalBrief(item.additionalBrief),
    }));

    const contentById = new Map(
        campaignContent.map((item) => [String(item._id), item]),
    );

    return {
        campaignName: String(campaignName ?? ""),
        socialMedia: resolveSocialMedia(content),
        campaignPrice: Number(totalPrice ?? 0),
        displayCurrency,
        addedAccounts: (accounts ?? []).map((account) => {
            const selected = account.selectedCampaignContentItem;
            const selectedContent = selected
                ? contentById.get(String(selected.campaignContentItemId))
                : undefined;
            const existingAdditionalBriefId = selected?.additionalBriefId;
            const hasExistingAdditionalBrief = Boolean(
                existingAdditionalBriefId &&
                selectedContent?.additionalBrief.some(
                    (brief) => String(brief._id) === String(existingAdditionalBriefId),
                ),
            );
            const additionalBriefId = hasExistingAdditionalBrief
                ? String(existingAdditionalBriefId)
                : selectedContent?.additionalBrief[0]?._id;

            return {
                socialAccountId: String(account.accountId ?? ""),
                influencerId: String(account.influencerId ?? ""),
                socialMedia: String(account.socialMedia ?? ""),
                username: String(account.username ?? ""),
                selectedCampaignContentItem: selected
                    ? {
                        campaignContentItemId: String(
                            selected.campaignContentItemId ?? "",
                        ),
                        descriptionId: String(selected.descriptionId ?? ""),
                        ...(additionalBriefId ? { additionalBriefId } : {}),
                    }
                    : null,
                dateRequest: String(account.dateRequest ?? "ASAP"),
                profileType: account.profileType ?? undefined,
            };
        }),
        campaignContent,
    };
};
