import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import type { TGetClientsParams } from "@/entities/client/model/client.types.ts";

export const useClientsPageState = () => {
  const limit = 10;

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

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

    if (page !== 1) {
      void setPage(1, { history: "replace" });
    }
  }, [
    debouncedSearchValue,
    query,
    page,
    setQuery,
    setPage,
  ]);

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

  const queryParams: TGetClientsParams = query.trim()
    ? { limit, search: query.trim() }
    : { page, limit };

  return {
    page,
    limit,
    query,
    searchValue,
    queryParams,

    setPage,
    handleSearchChange,
  };
};

