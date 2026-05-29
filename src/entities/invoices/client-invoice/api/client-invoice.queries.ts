import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getClientsInvoices } from "@/entities/invoices/client-invoice/api/client-invoice.api.ts";
import { clientsInvoicesQueryKeys } from "@/entities/invoices/client-invoice/api/client-invoice.query-keys.ts";
import type { TGetClientsInvoicesParams } from "@/entities/invoices/client-invoice/model/client-invoice.types.ts";

export const useClientsInvoicesQuery = (params: TGetClientsInvoicesParams) => {
  return useQuery({
    queryKey: clientsInvoicesQueryKeys.list(params),
    queryFn: () => getClientsInvoices(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

