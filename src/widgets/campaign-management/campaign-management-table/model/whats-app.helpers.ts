type WhatsAppPromoData = {
    influencerName: string;
    platform: string;
    page: string;
    content: string;
    description: string;
    storyTag: string;
    storyLink: string;
    specialRequest: string;
    reward: string;
};

type WhatsAppInfluencerPromoData = {
    influencerName: string;
    promos: WhatsAppPromoData[];
};

export const getInfluencerKey = (account: any) => {
    return String(
        account?.influencerId ??
        account?.influencer?._id ??
        account?.influencerName ??
        account?.username ??
        "",
    );
};

export const groupAccountsByInfluencer = (accounts: any[] = []) => {
    return accounts.reduce<Record<string, any[]>>((acc, account) => {
        const key = getInfluencerKey(account);
        if (!key) return acc;

        if (!acc[key]) acc[key] = [];
        acc[key].push(account);

        return acc;
    }, {});
};

export const buildWhatsAppPromoData = ({
                                           account,
                                           campaignContent,
                                       }: {
    account: any;
    campaignContent: any[];
}): WhatsAppPromoData => {
    const selectedRef =
        account.selectedCampaignContentItem ??
        account.selectedContent ??
        null;

    const selectedContentItem = selectedRef
        ? campaignContent.find(
        (item) =>
            String(item._id) === String(selectedRef.campaignContentItemId),
    ) ?? null
        : null;

    const selectedDescription = selectedContentItem?.descriptions?.find(
        (desc: any) =>
            String(desc._id) === String(selectedRef?.descriptionId),
    );

    return {
        influencerName: String(
            account.firstName || account.influencerName || account.username || "",
        ),
        platform: String(account.socialMedia ?? ""),
        page: String(account.username ?? ""),
        content: String(selectedContentItem?.mainLink ?? ""),
        description: String(selectedDescription?.description ?? ""),
        storyTag: String(selectedContentItem?.taggedUser ?? ""),
        storyLink: String(selectedContentItem?.taggedLink ?? ""),
        specialRequest: String(selectedContentItem?.additionalBrief ?? ""),
        reward: `${Number(account.price ?? 0)} EUR`,
    };
};

export const buildWhatsAppInfluencerPromoData = ({
                                                     accounts,
                                                     campaignContent,
                                                 }: {
    accounts: any[];
    campaignContent: any[];
}): WhatsAppInfluencerPromoData => {
    const promos = accounts.map((account) =>
        buildWhatsAppPromoData({
            account,
            campaignContent,
        }),
    );

    return {
        influencerName: String(
            accounts[0]?.firstName ||
            accounts[0]?.influencerName ||
            accounts[0]?.username ||
            "",
        ),
        promos,
    };
};

export const buildWhatsAppInfluencerPromoMessage = (
    data: WhatsAppInfluencerPromoData,
) => {
    const hasMultiplePromos = data.promos.length > 1;

    const promoLines = data.promos.flatMap((promo, index) => {
        const fields = [
            `Platform: ${promo.platform}`,
            `Page: ${promo.page}`,
            `Content: ${promo.content}`,
            `Description: ${promo.description}`,
            `Story Tag: ${promo.storyTag}`,
            `Story Link: ${promo.storyLink}`,
            `Special request: ${promo.specialRequest}`,
            `Reward: ${promo.reward}`,
            ``,
        ];

        if (!hasMultiplePromos) {
            return fields;
        }

        return [
            `PROMO ${index + 1}:`,
            ...fields,
        ];
    });

    return [
        `Hi ${data.influencerName || "there"},`,
        ``,
        hasMultiplePromos
            ? `You have new promo requests.`
            : `You have a new promo request.`,
        ``,
        `CAMPAIGN DETAILS:`,
        ``,
        ...promoLines,
        `You can manage this promo(s) in your account here:`,
        `https://go.soundinfluencers.com/account/influencer/new-promos`,
        ``,
        `Let us know if you'd like to take part in this campaign(s).`,
    ].join("\n");
};

export const buildWhatsAppPromoMessage = (data: WhatsAppPromoData) => {
    return buildWhatsAppInfluencerPromoMessage({
        influencerName: data.influencerName,
        promos: [data],
    });
};