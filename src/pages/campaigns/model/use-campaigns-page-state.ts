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
import { useCampaignManagementStore } from "@/pages/campaign-management-v2/store/campaign-management.store.ts";

export const CAMPAIGNS_ITEMS_LIMIT = [
  { label: "10 per page", value: 10 },
  { label: "20 per page", value: 20 },
  { label: "50 per page", value: 50 },
] as const satisfies {
  label: string;
  value: number;
}[];

export const useCampaignsPageState = () => {
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  )

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

  const resetCampaignDraft = useCampaignManagementStore(
    (state) => state.resetDraft,
  );

  const [searchValue, setSearchValue] = useState(query);
  const debouncedSearchValue = useDebounce(searchValue, 400);

  useEffect(() => {
    resetCampaignDraft();
  }, [resetCampaignDraft]);

  useEffect(() => {
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

  const handleLimitChange = (nextLimit: number) => {
    void setLimit(nextLimit, { history: "replace" });

    if (page !== 1) {
      void setPage(1, { history: "replace" });
    }
  };

  const queryParams: TGetCampaignParams = {
    page,
    limit,
    ...(status ? { status } : {}),
    ...(query.trim() ? { search: query.trim() } : {}),
  };

  return {
    page,
    limit,
    mode,
    status,
    query,
    searchValue,
    queryParams,

    setPage,
    handleModeChange,
    handleLimitChange,
    handleStatusChange,
    handleSearchChange,
  };
};
