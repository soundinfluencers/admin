import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfluencersOffersMatrixApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import type {
  IGetInfluencersOffersMatrixParams, IInfluencersOffersMatrix,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { influencersOffersQueryKeys } from "@/entities/influencers-offers/model/influencers-offers.query-keys.ts";

import {
  mergeByKey,
  mergeOfferAccountLinks,
  mergeOfferAccountRows,
} from "@/pages/influencers-offers-page/model/influencers-offers-page.helpers.ts";

type TInfluencersOffersPageParam = {
  offersCursor?: string;
  accountsCursor?: string;
};

type TInfluencersOffersLoadDirection = "accounts" | "offers";

export const useInfluencersOffersInfiniteQuery = (
  params: Omit<
    IGetInfluencersOffersMatrixParams,
    "offersCursor" | "accountsCursor"
  >,
) => {
  const loadDirectionRef = useRef<TInfluencersOffersLoadDirection | null>(null);

  const query = useInfiniteQuery({
    queryKey: influencersOffersQueryKeys.matrix(params),

    initialPageParam: {} as TInfluencersOffersPageParam,

    queryFn: ({ pageParam }) => {
      return getInfluencersOffersMatrixApi({
        ...params,
        offersCursor: pageParam.offersCursor,
        accountsCursor: pageParam.accountsCursor,
      });
    },

    getNextPageParam: (lastPage) => {
      const direction = loadDirectionRef.current;

      if (direction === "accounts") {
        return lastPage.accountsNextCursor
          ? { accountsCursor: lastPage.accountsNextCursor }
          : undefined;
      }

      if (direction === "offers") {
        return lastPage.offersNextCursor
          ? { offersCursor: lastPage.offersNextCursor }
          : undefined;
      }

      return undefined;
    },

    select: (data) => {
      const matrix = data.pages.reduce<IInfluencersOffersMatrix | null>(
        (acc, page) => {
          if (!acc) return page;

          return {
            offerHeaders: mergeByKey(
              acc.offerHeaders,
              page.offerHeaders,
              offer => offer.offerId,
            ),
            accountRows: mergeOfferAccountRows(
              acc.accountRows,
              page.accountRows,
            ),
            links: mergeOfferAccountLinks(
              acc.links,
              page.links,
            ),
            offersNextCursor: page.offersNextCursor,
            accountsNextCursor: page.accountsNextCursor,
          };
        },
        null,
      );

      return {
        ...data,
        matrix,
      };
    },

    refetchOnWindowFocus: false,
  });

  const fetchNextAccountsPage = () => {
    const nextCursor = query.data?.matrix?.accountsNextCursor;

    if (!nextCursor || query.isFetchingNextPage) return;

    loadDirectionRef.current = "accounts";

    void query.fetchNextPage();
  };

  const fetchNextOffersPage = () => {
    const nextCursor = query.data?.matrix?.offersNextCursor;

    if (!nextCursor || query.isFetchingNextPage) return;

    loadDirectionRef.current = "offers";

    void query.fetchNextPage();
  };

  return {
    ...query,
    matrix: query.data?.matrix ?? null,
    fetchNextAccountsPage,
    fetchNextOffersPage,
  };
};

