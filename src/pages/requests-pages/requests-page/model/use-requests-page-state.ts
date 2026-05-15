import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import type { IGetListRequestsRequest } from "@/entities/requests";

export const useRequestsPageState = () => {
  const [limit, _setLimitQuery] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

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
  }, [debouncedSearchValue, query, page, setPage, setQuery]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handlePageChange = (nextPage: number) => {
    void setPage(nextPage, { history: "replace" });
  };

  const queryParams: IGetListRequestsRequest = useMemo(
    () => ({
      limit,
      page,
      ...(query.trim() ? { search: query.trim() } : {}),
    }),
    [limit, page, query],
  );

  return {
    page,
    limit,
    query,
    searchValue,
    queryParams,

    handlePageChange,
    handleSearchChange,
  };
};
