import { useEffect, useState } from "react";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import {
  campaignsModeParser,
  campaignStatusParser, type TCampaignStatus,
} from "@/entities/campaign";

import type { TGetCampaignParams } from "@/entities/campaign";

export const useCampaignsPageState = () => {
  const limit = 10;

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

  const [mode, setMode] = useQueryState(
    "campaigns-mode",
    campaignsModeParser,
  );

  const [status, setStatus] = useQueryState(
    "campaigns-status",
    campaignStatusParser,
  );

  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault(""),
  );

  const [searchValue, setSearchValue] = useState(query);
  const debouncedSearchValue = useDebounce(searchValue, 400);

  const isSearchDisabled = !!status;

  useEffect(() => {
    if (isSearchDisabled && searchValue !== "") {
      setSearchValue("");
    }
  }, [isSearchDisabled, searchValue]);

  useEffect(() => {
    if (isSearchDisabled && query !== "") {
      void setQuery("", { history: "replace" });
    }
  }, [isSearchDisabled, query, setQuery]);

  useEffect(() => {
    if (isSearchDisabled) return;

    const normalizedSearch = debouncedSearchValue.trim();
    const normalizedQuery = query.trim();

    if (normalizedSearch !== normalizedQuery) {
      void setQuery(normalizedSearch, { history: "replace" });

      if (page !== 1) {
        void setPage(1, { history: "replace" });
      }
    }
  }, [
    debouncedSearchValue,
    query,
    isSearchDisabled,
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

  const handleStatusChange = (nextStatus: TCampaignStatus | null) => {
    const resolvedStatus = nextStatus === status ? null : nextStatus;

    void setStatus(resolvedStatus, { history: "replace" });
    void setPage(1, { history: "replace" });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleModeChange = () => {
    const nextMode = mode === "affiliate" ? "payments" : "affiliate";

    void setMode(nextMode, { history: "replace" });
    void setPage(1, { history: "replace" });
  };

  const queryParams: TGetCampaignParams =
    query.trim() && !status
      ? { limit, search: query.trim() }
      : {
        page,
        limit,
        ...(status ? { status } : {}),
      };

  return {
    page,
    limit,
    mode,
    status,
    query,
    searchValue,
    isSearchDisabled,
    queryParams,

    setPage,
    handleModeChange,
    handleStatusChange,
    handleSearchChange,
  };
};
