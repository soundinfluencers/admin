import { useEffect, useState } from "react";
import {
  parseAsString,
  useQueryState,
} from "nuqs";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import type {
  IPaymentHistoryMatrix,
  TGetPaymentHistoryParams,
} from "@/entities/payment-history/model/payment-history.types.ts";

export const EMPTY_PAYMENT_HISTORY_MATRIX: IPaymentHistoryMatrix = {
  campaigns: [],
  accounts: [],
  cells: [],
  meta: {},
};

export const usePaymentHistoryPageState = () => {
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault(""),
  );

  const [searchValue, setSearchValue] = useState(query);
  const debouncedSearchValue = useDebounce(searchValue, 400);

  const normalizedSearch = debouncedSearchValue.trim();

  useEffect(() => {
    void setQuery(normalizedSearch, { history: "replace" });
  }, [debouncedSearchValue, normalizedSearch, setQuery]);

  const queryParams: Omit<
    TGetPaymentHistoryParams,
    "campaignsCursor" | "accountsCursor"
  > = {
    campaignsTake: 10,
    accountsTake: 10,
    search: normalizedSearch || undefined,
    socialMedia: undefined,
    effectiveStatus: undefined,
  };

  return {
    query,
    searchValue,
    queryParams,

    handleSearchChange: setSearchValue,
  };
};
