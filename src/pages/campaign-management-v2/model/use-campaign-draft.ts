import { useEffect } from "react";
import { useCampaignDetailsQuery } from "@/entities/campaign/api/use-campaigns-query.ts";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types.ts";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";

interface DeletedOptionRecovery {
  isCurrent: () => boolean;
  onSnapshotApplied: () => void;
  onError: () => void;
}

export const useCampaignDraft = (
  params: ICampaignDetailsRequestParams | null,
  enabled = true,
  recovery?: DeletedOptionRecovery,
) => {
  const {
    data: serverCampaign,
    isError: isQueryError,
    error: queryError,
    isFetchedAfterMount,
    isFetching,
  } = useCampaignDetailsQuery(params, enabled, recovery !== undefined);

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
      !enabled ||
      (recovery && !recovery.isCurrent()) ||
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
    recovery?.onSnapshotApplied();
  }, [enabled, recovery, params, serverCampaign, isCurrentDraft, initializeDraft, isFetchedAfterMount, isFetching, isQueryError]);

  useEffect(() => {
    if (enabled && isQueryError && !isFetching && recovery?.isCurrent()) {
      recovery.onError();
    }
  }, [enabled, recovery, isQueryError, isFetching]);

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
