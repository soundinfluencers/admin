import { useMemo } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import type {
  IGetInfluencerHistoryDetailsQueryParams,
} from "@/entities/influencer-history/model/influencer-history-detail.types.ts";

export const useInfluencersHistoryDetailsPageState = () => {
  const [limit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(50),
  );

  const [page, setPageQuery] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

  const handlePageChange = (nextPage: number) => {
    void setPageQuery(nextPage, { history: "replace" });
  };

  const queryParams: IGetInfluencerHistoryDetailsQueryParams = useMemo(
    () => ({
      limit,
      page
    }),
    [limit, page],
  );

  return {
    page,
    queryParams,
    handlePageChange,
  };
};
