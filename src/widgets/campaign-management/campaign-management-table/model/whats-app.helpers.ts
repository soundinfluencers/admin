type WhatsAppPromoData = {
    influencerName: string;
    platform: string;
    page: string;
    content: string;
    description: string;
    storyTag: string;
    storyRequest: string;
    storyLink: string;
    specialRequest: string;
    reward: string;
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
        influencerName: String(account.firstName || account.influencerName || account.username || ""),
        platform: String(account.socialMedia ?? ""),
        page: String(account.username ?? ""),
        content: String(selectedContentItem?.mainLink ?? ""),
        description: String(selectedDescription?.description ?? ""),
        storyTag: String(selectedContentItem?.taggedUser ?? ""),
        storyRequest: String(account.dateRequest ?? ""),
        storyLink: String(selectedContentItem?.taggedLink ?? ""),
        specialRequest: String(selectedContentItem?.additionalBrief ?? ""),
        reward: `${Number(account.publicPrice ?? 0)} EUR`,
    };
};

export const buildWhatsAppPromoMessage = (data: {
    influencerName?: string;
    platform: string;
    page: string;
    content: string;
    description: string;
    storyTag: string;
    storyRequest: string;
    storyLink: string;
    specialRequest: string;
    reward: string;
}) => {
    return [
        `Hi ${data?.influencerName},`,
        ``,
        `You have a new promo request.`,
        ``,
        `CAMPAIGN DETAILS:`,
        ``,
        `Platform: ${data.platform}`,
        `Page: ${data.page}`,
        `Content: ${data.content}`,
        `Description: ${data.description}`,
        `Story Tag: ${data.storyTag}`,
        `Story Request: ${data.storyRequest}`,
        `Story Link: ${data.storyLink}`,
        `Special request: ${data.specialRequest}`,
        `Reward: ${data.reward}`,
        ``,
        `You can manage this promo(s) in your account here:`,
        `https://go.soundinfluencers.com/account/influencer/new-promos`,
        ``,
        `Let us know if you'd like to take part in this campaign(s).`,
    ].join("\n");
};

