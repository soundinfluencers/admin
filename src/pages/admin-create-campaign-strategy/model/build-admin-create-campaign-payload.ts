
type Params = {
    campaignName: string;
    totalPrice: number;
    accounts: any[];
    content: any[];
};

const resolveSocialMedia = (content: any[]) => {
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

export const buildAdminCreateCampaignPayload = ({
                                                    campaignName,
                                                    totalPrice,
                                                    accounts,
                                                    content,
                                                }: Params) => {
    return {
        campaignName: String(campaignName ?? ""),
        socialMedia: resolveSocialMedia(content),
        campaignPrice: Number(totalPrice ?? 0),
        addedAccounts: (accounts ?? []).map((account) => ({
            socialAccountId: String(account.accountId ?? ""),
            influencerId: String(account.influencerId ?? ""),
            socialMedia: String(account.socialMedia ?? ""),
            username: String(account.username ?? ""),
            selectedCampaignContentItem: account.selectedCampaignContentItem
                ? {
                    campaignContentItemId: String(
                        account.selectedCampaignContentItem.campaignContentItemId ?? "",
                    ),
                    descriptionId: String(
                        account.selectedCampaignContentItem.descriptionId ?? "",
                    ),
                }
                : null,
            dateRequest: String(account.dateRequest ?? "ASAP"),
            profileType: account.profileType ?? undefined,
        })),
        campaignContent: (content ?? []).map((item) => ({
            _id: String(item._id ?? ""),
            socialMedia: String(item.socialMedia ?? ""),
            profileType: item.profileType ?? undefined,
            socialMediaGroup: String(item.socialMediaGroup ?? ""),
            mainLink: String(item.mainLink ?? ""),
            descriptions: (item.descriptions ?? []).map((description: any) => ({
                _id: String(description._id ?? ""),
                description: String(description.description ?? ""),
            })),
            taggedUser: String(item.taggedUser ?? ""),
            taggedLink: String(item.taggedLink ?? ""),
            additionalBrief: String(item.additionalBrief ?? ""),
        })),
    };
};