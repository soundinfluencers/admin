import type { TPaymentHistoryEffectiveStatus } from "@/entities/payment-history/model/payment-history.types.ts";

export const PAYMENT_HISTORY_STATUSES = [
  {
    color: "#E5E4FF",
    value: "paid",
    label: "paid (not auto)",
  },
  {
    color: "#FFF2BC",
    value: "in_process",
    label: "in process (auto)",
  },
  {
    color: "#A4F4CF",
    value: "done",
    label: "done (auto)",
  },
] as const satisfies ReadonlyArray<{
  color: string;
  value: TPaymentHistoryEffectiveStatus;
  label: string;
}>;
