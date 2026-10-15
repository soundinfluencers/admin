import type {
  ICampaignDetails,
} from "./campaign-details.types.ts";

import type {
  TCampaignWhatsAppAccountUpdate,
} from "./campaign-whatsapp.types.ts";

export const applyWhatsAppUpdatesToCampaign = (
  campaign: ICampaignDetails,
  updates: readonly TCampaignWhatsAppAccountUpdate[],
): ICampaignDetails => {
  if (updates.length === 0) return campaign;

  const updatesById = new Map(
    updates.map((update) => [update.addedAccountsId, update]),
  );

  let hasChanges = false;

  const addedAccounts = campaign.addedAccounts.map((account) => {
    const update = updatesById.get(account.addedAccountsId);

    if (!update) return account;

    if (
      account.whatsappStatus === update.whatsappStatus &&
      account.whatsappLastAttemptAt === update.whatsappLastAttemptAt
    ) {
      return account;
    }

    hasChanges = true;

    return {
      ...account,
      whatsappStatus: update.whatsappStatus,
      whatsappLastAttemptAt: update.whatsappLastAttemptAt,
    };
  });

  return hasChanges
    ? { ...campaign, addedAccounts }
    : campaign;
};
