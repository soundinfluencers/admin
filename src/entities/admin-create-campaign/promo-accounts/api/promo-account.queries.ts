// @ts-nocheck
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    getPromoAccountsByFilters,
    searchPromoAccounts,
} from "./promo-account.api";
import type { PromoAccountsFiltersBody } from "@/entities/admin-create-campaign/campaign-filter/model/campaign-filter.types";

export const usePromoAccountsByFiltersQuery = ({
                                                   body,
                                                   sortBy,
                                                   limit,
                                                   enabled,
                                               }: {
    body: PromoAccountsFiltersBody;
    sortBy: string;
    limit: number;
    enabled: boolean;
}) => {

    return useQuery({
        queryKey: ["promo-accounts-admin", body, sortBy, limit] as const,
        queryFn: () =>
            getPromoAccountsByFilters({
                body,
                sortBy,
                limit,
            }),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

export const useSearchPromoAccountsQuery = ({
                                                query,
                                                socialMedias,
                                                page,
                                                limit,
                                                enabled,
                                            }: {
    query: string;
    socialMedias: string[];
    page: number;
    limit: number;
    enabled: boolean;
}) => {
    return useQuery({
        queryKey: [
            "promo-accounts-search-admin",
            query,
            socialMedias,
            page,
            limit,
        ] as const,
        queryFn: () =>
            searchPromoAccounts({
                query,
                socialMedias,
                page,
                limit,
            }),
        enabled,
        staleTime: 15_000,
    });
};