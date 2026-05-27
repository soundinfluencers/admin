import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import {
  parseAsString,
  useQueryState,
} from "nuqs";
import type { TGetInfluencerHistoryParams, TGetInfluencerSearchHistoryParams } from "@/entities/influencer-history/model/influencer-history.types.ts";

export const useInfluencersHistoryPageState = () => {
  const LIMIT = 10;

  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault(""),
  );

  const [searchValue, setSearchValue] = useState(query);
  const debouncedSearchValue = useDebounce(searchValue, 400);

  useEffect(() => {
    const normalizedSearch = debouncedSearchValue.trim();
    const normalizedQuery = query.trim();

    if (normalizedSearch === normalizedQuery) return;

    void setQuery(normalizedSearch, { history: "replace" });
  }, [debouncedSearchValue, query, setQuery]);

  // Sync local input value when query changes externally (e.g. browser back/forward)
  useEffect(() => {
    if (query.trim() !== searchValue.trim()) {
      setSearchValue(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const historyQueryParams: TGetInfluencerHistoryParams = useMemo(
    () => ({
      limit: LIMIT,
    }),
    [],
  );

  const searchQueryParams: TGetInfluencerSearchHistoryParams = useMemo(
    () => ({
      limit: LIMIT,
      search: query.trim(),
    }),
    [query],
  );

  return {
    query,
    searchValue,
    historyQueryParams,
    searchQueryParams,
    handleSearchChange,
  };
};
