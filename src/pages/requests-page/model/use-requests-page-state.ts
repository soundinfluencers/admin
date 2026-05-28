import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import type { IGetListRequestsParams, TRequestFilterStatus } from "@/entities/requests/model/requests.types.ts";
import {
  requestStatusSearchParamParser
} from "@/features/requests/request-filter-by-status/model/request-filter-by-status-param.ts";
import {
  requestLifecycleSearchParamParser
} from "@/features/requests/toggle-request-status/model/toggle-request-status-param.ts";

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

  const [type, setType] = useQueryState(
    "type",
    requestStatusSearchParamParser
  );

  const [status, setStatus] = useQueryState(
    'status',
    requestLifecycleSearchParamParser
  );

  const [searchValue, setSearchValue] = useState(query);
  const debouncedSearchValue = useDebounce(searchValue, 400);

  // Sync local input value when query changes externally (e.g. browser back/forward)
  useEffect(() => {
    if (query.trim() !== searchValue.trim()) {
      setSearchValue(query);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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

  const handleTypeChange = (nextType: TRequestFilterStatus | null) => {
    const resolvedStatus = nextType === type ? null : nextType;

    void setType(resolvedStatus, { history: "replace" });
    void setPage(1, { history: "replace" });
  }

  const handleToggleModeChange = () => {
    const resolvedMode = status === 'OPEN' ? 'CLOSED' : 'OPEN';

    void setStatus(resolvedMode, { history: "replace" });
    void setPage(1, { history: "replace" });
  }

  const queryParams: IGetListRequestsParams = useMemo(
    () => ({
      limit,
      page,
      state: status,
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(type ? { group: type } : {}),
    }),
    [limit, page, query, status, type],
  );

  return {
    page,
    limit,
    query,
    searchValue,
    type,
    status,
    queryParams,

    handlePageChange,
    handleSearchChange,
    handleTypeChange,
    handleToggleModeChange,
  };
};
