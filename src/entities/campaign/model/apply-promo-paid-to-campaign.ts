import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
} from "./campaign-details.types.ts";

export const applyPromoPaidToCampaign = (
  campaign: ICampaignDetails,
  { promoId, closePromo, statusLabel }: IMarkPromoPaidResponse["data"],
): ICampaignDetails => {
  const account = campaign.addedAccounts.find(
    (item) => item.addedAccountsId === promoId,
  );

  if (
    !account ||
    (account.closePromo === closePromo && account.statusLabel === statusLabel)
  ) {
    return campaign;
  }

  return {
    ...campaign,
    addedAccounts: campaign.addedAccounts.map((item) =>
      item.addedAccountsId === promoId
        ? { ...item, closePromo, statusLabel }
        : item,
    ),
  };
};
