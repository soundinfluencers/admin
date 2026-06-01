import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getInfluencersInvoices } from "../api/influencer-invoice.api.ts";
import { influencersInvoicesQueryKeys } from "../api/influencer-invoice.query-keys.ts";
import type { TGetInfluencersInvoicesParams } from "../model/influencer-invoice.types.ts";

export const useInfluencersInvoicesQuery = (params: TGetInfluencersInvoicesParams) => {
  return useQuery({
    queryKey: influencersInvoicesQueryKeys.list(params),
    queryFn: () => getInfluencersInvoices(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};
