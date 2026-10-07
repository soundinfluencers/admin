import type {
  TCampaignManagementMeta,
} from "./campaign-management-store.types";

export const CAMPAIGN_MANAGEMENT_STORAGE_KEY =
  "campaign-management-draft";

export const CAMPAIGN_MANAGEMENT_VERSION = 2;

export const CAMPAIGN_MANAGEMENT_TTL_MS = 2 * 60 * 60 * 1000;

export const createCampaignManagementMeta =
  (): TCampaignManagementMeta => {
    const now = Date.now();

    return {
      updatedAt: now,
      expiresAt: now + CAMPAIGN_MANAGEMENT_TTL_MS,
    };
  };

export const isCampaignManagementExpired = (
  expiresAt: number | null,
): boolean => {
  return expiresAt !== null && Date.now() >= expiresAt;
};
