import { useQuery } from "@tanstack/react-query";
import { getInvoiceById } from "@/entities/invoices/api/get-invoice-by-id.ts";
import { invoiceQueryKeys } from "@/entities/invoices/api/invoice.query-keys.ts";

export const useInvoiceQuery = (invoiceId: string) => {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: () => getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 60 * 1000,
  });
};
