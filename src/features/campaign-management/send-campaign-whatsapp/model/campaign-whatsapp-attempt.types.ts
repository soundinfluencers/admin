import {
  WHATSAPP_STATUS,
  WHATSAPP_STATUS_LABELS,
  type TWhatsAppStatus,
} from "@/entities/campaign/model/campaign-whatsapp.types";

export type TCampaignWhatsAppAttemptStatus =
  | Exclude<TWhatsAppStatus, typeof WHATSAPP_STATUS.NOT_SENT>
  | "sending"
  | "unknown";

export type TCampaignWhatsAppAttempts = Partial<
  Record<string, TCampaignWhatsAppAttemptStatus>
>;

export const CAMPAIGN_WHATSAPP_VIEW_STATUS_LABELS = {
  ...WHATSAPP_STATUS_LABELS,
  sending: "Sending…",
  unknown: "Result unknown",
};
