import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientInvoice } from "@/entities/invoices/client-invoice/api/client-invoice.api.ts";
import { invoiceQueryKeys } from "@/entities/invoices/api/invoice.query-keys.ts";
import type { IInvoice } from "@/entities/invoices/model/invoice.types.ts";

export const useUpdateClientInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientInvoice,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: invoiceQueryKeys.detail(variables.invoiceId),
      });

      const previousInvoice = queryClient.getQueryData<IInvoice>(
        invoiceQueryKeys.detail(variables.invoiceId),
      );

      queryClient.setQueryData<IInvoice>(
        invoiceQueryKeys.detail(variables.invoiceId),
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            ...variables.dto,
          };
        },
      );

      return { previousInvoice };
    },

    onError: (_error, variables, context) => {
      if (context?.previousInvoice) {
        queryClient.setQueryData(
          invoiceQueryKeys.detail(variables.invoiceId),
          context.previousInvoice,
        );
      }
    },
  });
};
