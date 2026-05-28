import type {
  ICampaignItem,
  ICampaignRequestDetailsDto,
  TCampaignPaymentMethod,
} from "@/entities/requests/model/requests.types.ts";

type TCampaignPersonalRequestField = {
  key: keyof ICampaignRequestDetailsDto;
  label: string;
};

export const PERSONAL_INFO_FIELDS = [
  { key: "campaignName", label: "Campaign name:" },
  { key: "paymentMethod", label: "Payment method:" },
  { key: "firstName", label: "First name:" },
  { key: "lastName", label: "Last name:" },
  { key: "email", label: "Email:" },
] as const satisfies readonly TCampaignPersonalRequestField[];

export const PAYMENT_METHODS_LABEL = {
  bank_card: "Bank card",
  paypal: "PayPal",
  bank_transfer_uk: "Bank transfer UK",
  bank_transfer_eu: "Bank transfer EU",
  bank_transfer_international: "Bank transfer International",
} as const satisfies Record<TCampaignPaymentMethod, string>;


type TCampaignField = {
  key: keyof ICampaignItem;
  label: string;
}

export const CAMPAIGN_INFO_FIELDS = [
  { key: "socialMedia", label: "Platform:" },
  { key: "mainLink", label: "Track link:" },
  { key: "descriptions", label: "Post descriptions:" },
  // { key: "", label: "Content creation:" },
  { key: "additionalBrief", label: "Additional brief:" },
  // { key: "", label: "Deadline:" },
  { key: "accounts", label: "Influencers:" },
] as const satisfies readonly TCampaignField[];
