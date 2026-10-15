import { useEffect } from "react";
import { useCampaignDetailsQuery } from "@/entities/campaign/api/use-campaigns-query.ts";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types.ts";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";

export const useCampaignDraft = (
  params: ICampaignDetailsRequestParams | null,
) => {
  const {
    data: serverCampaign,
    isError: isQueryError,
    error: queryError,
    isFetchedAfterMount,
    isFetching,
  } = useCampaignDetailsQuery(params);

  const draft = useCampaignManagementStore((state) => state.draft);
  const initializeDraft = useCampaignManagementStore((state) => state.initializeDraft);

  const isCurrentDraft =
    params !== null &&
    draft !== null &&
    draft.params.campaignId === params.campaignId &&
    draft.params.status === params.status &&
    draft.params.optionIndex === params.optionIndex;

  useEffect(() => {
    if (
      !params ||
      !serverCampaign ||
      isCurrentDraft ||
      !isFetchedAfterMount ||
      isFetching ||
      isQueryError
    ) {
      return;
    }

    initializeDraft({
      params,
      campaign: serverCampaign,
    });
  }, [params, serverCampaign, isCurrentDraft, initializeDraft, isFetchedAfterMount, isFetching, isQueryError]);

  const campaign = isCurrentDraft ? draft.campaign : null;
  const isError = campaign === null && isQueryError && !isFetching;

  return {
    campaign,
    isCurrentDraft,
    isInvalidParams: params === null,
    isPending: params !== null && campaign === null && !isError,
    isError,
    error: isError ? queryError : null,
  };
};
