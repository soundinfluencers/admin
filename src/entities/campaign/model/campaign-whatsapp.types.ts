import type { TSocialMedia } from "@/shared/constants/social-media-taxonomy.ts";
import type { ICampaignDetails } from "./campaign-details.types.ts";

export const WHATSAPP_STATUS = {
  SENT: "sent",
  NOT_SENT: "not_sent",
  FAILED: "failed",
} as const;

export type TWhatsAppStatus = (typeof WHATSAPP_STATUS)[keyof typeof WHATSAPP_STATUS];

export const WHATSAPP_STATUS_LABELS = {
  [WHATSAPP_STATUS.SENT]: 'Sent',
  [WHATSAPP_STATUS.NOT_SENT]: 'Not Sent',
  [WHATSAPP_STATUS.FAILED]: 'Failed',
} satisfies Record<TWhatsAppStatus, string>;

export interface ISendCampaignWhatsAppRequest {
  campaignId: string;
  influencerId: string;
  accountId: string;
  socialMedia: TSocialMedia;
  message: string;
  clientId?: string;
}

export interface ISendCampaignWhatsAppResponse {
  status: typeof WHATSAPP_STATUS.SENT;
}

export type TCampaignWhatsAppAccountUpdate = Pick<
  ICampaignDetails["addedAccounts"][number],
  "addedAccountsId" | "whatsappStatus" | "whatsappLastAttemptAt"
>;
