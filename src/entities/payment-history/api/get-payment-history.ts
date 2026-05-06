import { $api } from "@/app/api/http.ts";
import type {
  IPaymentHistoryResponse,
  TGetPaymentHistoryParams,
} from "@/entities/payment-history/model/payment-history.types.ts";

export const getPaymentHistory = async (
  params: TGetPaymentHistoryParams,
) => {
  console.log("Fetching payment history with params:", params);

  const { data } = await $api.get<IPaymentHistoryResponse>('/admin/payments-history', {
    params,
  });

  console.log("Received payment history response:", data);

  return data.data;
};
