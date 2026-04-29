import type { TGetPaymentHistoryParams } from "@/entities/payment-history/model/payment-history.types.ts";

export const paymentHistoryQueryKeys = {
  all: ["payment-history-matrix"] as const,

  matrix: (params: TGetPaymentHistoryParams) =>
    [...paymentHistoryQueryKeys.all, "matrix", params] as const,
};
