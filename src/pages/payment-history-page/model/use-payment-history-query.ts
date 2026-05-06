import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPaymentHistory } from "@/entities/payment-history/api/get-payment-history";
import type {
  IPaymentHistoryMatrix,
  TGetPaymentHistoryParams,
} from "@/entities/payment-history/model/payment-history.types";
import { paymentHistoryQueryKeys } from "@/entities/payment-history/model/payment-history.query-keys";
import { mergeById, mergeCells } from "@/pages/payment-history-page/model/payment-history-page.helpers.ts";

type TPaymentHistoryPageParam = {
  campaignsCursor?: string;
  accountsCursor?: string;
};

type TPaymentHistoryLoadDirection = "accounts" | "campaigns";

export const usePaymentHistoryInfiniteQuery = (
  params: Omit<TGetPaymentHistoryParams, "campaignsCursor" | "accountsCursor">,
) => {
  const loadDirectionRef = useRef<TPaymentHistoryLoadDirection | null>(null);

  const query = useInfiniteQuery({
    queryKey: paymentHistoryQueryKeys.matrix(params),

    initialPageParam: {} as TPaymentHistoryPageParam,

    queryFn: ({ pageParam }) => {
      return getPaymentHistory({
        ...params,
        campaignsCursor: pageParam.campaignsCursor,
        accountsCursor: pageParam.accountsCursor,
      });
    },

    getNextPageParam: (lastPage) => {
      const direction = loadDirectionRef.current;

      if (direction === "accounts") {
        const cursor = lastPage.meta?.accountsNextCursor;

        return cursor
          ? {
            accountsCursor: cursor,
          }
          : undefined;
      }

      if (direction === "campaigns") {
        const cursor = lastPage.meta?.campaignsNextCursor;

        return cursor
          ? {
            campaignsCursor: cursor,
          }
          : undefined;
      }

      return undefined;
    },

    select: (data) => {
      const matrix = data.pages.reduce<IPaymentHistoryMatrix | null>(
        (acc, page) => {
          if (!acc) return page;

          return {
            campaigns: mergeById(acc.campaigns, page.campaigns, "campaignId"),
            accounts: mergeById(acc.accounts, page.accounts, "accountId"),
            cells: mergeCells(acc.cells, page.cells),
            meta: page.meta,
          };
        },
        null,
      );

      return {
        ...data,
        matrix,
      };
    },
  });

  const fetchNextAccountsPage = () => {
    const nextCursor = query.data?.matrix?.meta?.accountsNextCursor;

    if (!nextCursor || query.isFetchingNextPage) return;

    loadDirectionRef.current = "accounts";

    void query.fetchNextPage();
  };

  const fetchNextCampaignsPage = () => {
    const nextCursor = query.data?.matrix?.meta?.campaignsNextCursor;

    if (!nextCursor || query.isFetchingNextPage) return;

    loadDirectionRef.current = "campaigns";

    void query.fetchNextPage();
  };

  return {
    ...query,
    matrix: query.data?.matrix ?? null,
    fetchNextAccountsPage,
    fetchNextCampaignsPage,
  };
};
