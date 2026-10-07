import type { TCampaignManagementStore } from "./campaign-management-store.types.ts";

export const selectCurrentFollowers = (
  state: TCampaignManagementStore,
): number =>
  state.draft?.campaign.addedAccounts.reduce(
    (sum, account) => sum + account.followers,
    0,
  ) ?? 0;
