import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInvoiceById } from "@/entities/invoices/api/update-invoice.ts";
import {
  influencersInvoicesQueryKeys
} from "@/entities/invoices/influencer-invoice/api/influencer-invoice.query-keys.ts";
import type {
  IInfluencersInvoicesListPayload
} from "@/entities/invoices/influencer-invoice/model/influencer-invoice.types.ts";

export const useUpdateInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoiceById,

    onMutate: async (invoiceId: string) => {
      await queryClient.cancelQueries({
        queryKey: influencersInvoicesQueryKeys.lists(),
      });

      const previousLists = queryClient.getQueriesData<IInfluencersInvoicesListPayload>({
        queryKey: influencersInvoicesQueryKeys.lists(),
      });

      queryClient.setQueriesData<IInfluencersInvoicesListPayload>(
        { queryKey: influencersInvoicesQueryKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.map((invoice) =>
              invoice.invoiceId === invoiceId
                ? { ...invoice, isPaid: true }
                : invoice,
            ),
          };
        },
      );

      return { previousLists };
    },

    onError: (_error, _invoiceId, context) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: influencersInvoicesQueryKeys.lists(),
      });
    },
  });
};
