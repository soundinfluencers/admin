import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce.ts";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import type { TGetClientsInvoicesParams } from "@/entities/invoices/model/clients-invoices.types.ts";

export const useClientsInvoicesPageState = () => {
  const LIMIT = 10;

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

  const handlePageChange = (nextPage: number) => {
    void setPage(nextPage, { history: "replace" });
  };

  const clientsInvoiceQueryParams: TGetClientsInvoicesParams = useMemo(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      return {
        search: normalizedQuery,
      };
    }

    return {
      page,
      limit: LIMIT,
    };
  }, [query, page]);

  return {
    page,
    searchValue,
    clientsInvoiceQueryParams,
    handleSearchChange,
    handlePageChange,
  };
};
