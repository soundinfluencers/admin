export const getContentId = (item: any) => {
    return String(item?._id ?? item?.id ?? "");
};

export const getAccountSelectedContentId = (account: any) => {
    return String(
        account?.selectedCampaignContentItem?.campaignContentItemId ??
        account?.selectedContent?.campaignContentItemId ??
        account?.selectedContentItem?._id ??
        "",
    );
};

export const buildAccountsByContentId = (accounts: any[]) => {
    return (accounts ?? []).reduce<Record<string, any[]>>((acc, account) => {
        const contentId = getAccountSelectedContentId(account);

        if (!contentId) return acc;

        if (!acc[contentId]) {
            acc[contentId] = [];
        }

        acc[contentId].push(account);

        return acc;
    }, {});
};

export const getNetworksForContentItem = (
    item: any,
    accountsByContentId: Record<string, any[]>,
) => {
    const contentId = getContentId(item);
    return accountsByContentId[contentId] ?? [];
};

export const filterContentWithAccounts = (
    items: any[],
    accountsByContentId: Record<string, any[]>,
) => {
    return (items ?? []).filter((item) => {
        const contentId = getContentId(item);
        return (accountsByContentId[contentId] ?? []).length > 0;
    });
};