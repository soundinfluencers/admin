import { $api } from "@/app/api/http.ts";
import type {
  IInfluencersInvoicesListResponse,
  TGetInfluencersInvoicesParams,
} from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";

export const getInfluencersInvoices = async (params: TGetInfluencersInvoicesParams) => {
  console.log("Get Influencers Invoices", params);

  const { data } = await $api.get<IInfluencersInvoicesListResponse>('/admin/invoices/influencer', {
    params,
  });

  console.log('Successfully get Clients Invoices', data);

  return data.data;
};
