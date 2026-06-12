import type { TCampaignStatus, TPaymentStatus } from "@/entities/campaign";

export const PROMO_STATUS = {
  pending: 'Pending',
  distributing: 'Distributing',
  completed: 'Completed',
  proposal: 'Proposal',
} as const satisfies Record<TCampaignStatus, string>;

export const PROMO_AFFILIATE_STATUS = {}

export const PROMO_PAYMENT_STATUS_PAYMENTS = {
  wait: "Wait",
  confirmed: "Confirmed",
} as const satisfies Record<TPaymentStatus, string>;

export const PROMO_PAYMENT_STATUS_AFFILIATE = {}
