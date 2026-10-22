import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notifyUnhandledApiError } from "@/app/api/errors/notify.ts";
import { deleteProposalOption } from "@/entities/campaign/api/campaign.api.ts";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys.ts";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types.ts";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";
import { isSameCampaignContext } from "../store/campaign-management.comparison";

type Phase = "idle" | "confirm" | "deleting" | "refreshing" | "refresh-error" | "navigation-error";

type Execution = {
  active: boolean;
  busy: boolean;
  deleted: boolean;
  isLastOption: boolean;
  contextKey: string;
  nextContextKey: string | null;
};

interface Options {
  params: ICampaignDetailsRequestParams | null;
  isUnavailable: () => boolean;
  onSnapshotApplied: () => void;
  synchronizeOptionIndex: (optionIndex: number) => Promise<unknown>;
}

const CAMPAIGNS_HREF = "/dashboard/campaigns";

export const useDeleteProposalOptionActions = ({
  params,
  isUnavailable,
  onSnapshotApplied,
  synchronizeOptionIndex,
}: Options) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const executionRef = useRef<Execution | null>(null);
  const [willDeleteCampaign, setWillDeleteCampaign] = useState(false);
  const [isRecoveryQueryReady, setIsRecoveryQueryReady] = useState(false);

  const contextKey = JSON.stringify(params);
  const [previousContext, setPreviousContext] = useState(contextKey);

  if (previousContext !== contextKey) {
    setPreviousContext(contextKey);
    if (executionRef.current?.nextContextKey !== contextKey) {
      setPhase("idle");
      phaseRef.current = "idle";
      setWillDeleteCampaign(false);
      setIsRecoveryQueryReady(false);
    }
  }

  useLayoutEffect(() => {
    const previous = executionRef.current;
    // Keep the execution only for its own replace-navigation to option 0.
    if (previous?.active && previous.nextContextKey === contextKey) {
      previous.contextKey = contextKey;
      previous.nextContextKey = null;
      return;
    }
    if (previous) previous.active = false;

    executionRef.current = {
      active: true,
      busy: false,
      deleted: false,
      isLastOption: false,
      contextKey,
      nextContextKey: null,
    };
  }, [contextKey]);

  useLayoutEffect(() => () => {
    if (executionRef.current) executionRef.current.active = false;
  }, []);

  const isCurrent = (execution: Execution) =>
    execution.active && executionRef.current === execution;

  const changePhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const getCurrentDraft = () => {
    const draft = useCampaignManagementStore.getState().draft;
    if (
      !params || params.status !== "proposal" ||
      params.optionIndex === undefined ||
      !Number.isInteger(params.optionIndex) || params.optionIndex < 0 ||
      !draft || !isSameCampaignContext(draft.params, params) ||
      !draft.campaign.existingOptions.includes(params.optionIndex)
    ) return null;
    return draft;
  };

  const targetParams: ICampaignDetailsRequestParams | null = params
    ? { ...params, optionIndex: 0 }
    : null;

  const search = new URLSearchParams(location.search);
  search.set("proposal-option", "0");
  const optionHref = params
    ? `/dashboard/campaigns/campaign-management/proposal/${encodeURIComponent(params.campaignId)}?${search}`
    : CAMPAIGNS_HREF;

  const isDeletedOptionRecoveryCurrent = () => {
    const execution = executionRef.current;
    return Boolean(
      execution && isCurrent(execution) && execution.deleted &&
      !execution.isLastOption && execution.contextKey === contextKey &&
      params?.optionIndex === 0 && isRecoveryQueryReady &&
      phaseRef.current === "refreshing",
    );
  };

  const onDeletedOptionSnapshotApplied = () => {
    const execution = executionRef.current;
    if (!execution || !isDeletedOptionRecoveryCurrent()) return;
    execution.deleted = false;
    execution.nextContextKey = null;
    setIsRecoveryQueryReady(false);
    onSnapshotApplied();
    changePhase("idle");
  };

  const onDeletedOptionRefreshError = () => {
    if (isDeletedOptionRecoveryCurrent()) changePhase("refresh-error");
  };

  const openDeleteOptionModal = () => {
    const execution = executionRef.current;
    const draft = getCurrentDraft();
    if (
      !execution || !isCurrent(execution) || execution.busy || execution.deleted ||
      phaseRef.current !== "idle" || isUnavailable() || !draft
    ) return;
    setWillDeleteCampaign(draft.campaign.existingOptions.length === 1);
    changePhase("confirm");
  };

  const closeDeleteOptionModal = () => {
    if (phaseRef.current === "confirm" && !executionRef.current?.busy) {
      changePhase("idle");
    }
  };

  const confirmDeleteOption = async () => {
    const execution = executionRef.current;
    const draft = getCurrentDraft();
    if (
      !execution || !isCurrent(execution) || execution.busy || execution.deleted ||
      phaseRef.current !== "confirm" || isUnavailable() || !draft ||
      draft.params.optionIndex === undefined
    ) return;

    execution.busy = true;
    execution.isLastOption = draft.campaign.existingOptions.length === 1;
    changePhase("deleting");
    const filters = {
      queryKey: [...campaignsQueryKeys.details(), { campaignId: draft.params.campaignId }],
    };

    try {
      try {
        await queryClient.cancelQueries(filters);
        await deleteProposalOption({
          campaignId: draft.params.campaignId,
          optionIndex: draft.params.optionIndex,
        });
      } catch (error) {
        if (isCurrent(execution)) {
          changePhase("confirm");
          notifyUnhandledApiError(error);
        }
        return;
      }

      execution.deleted = true;
      // Successful deletion invalidates every index, even if the page has left.
      await queryClient.cancelQueries(filters);
      queryClient.removeQueries(filters);
      await queryClient.invalidateQueries({
        queryKey: campaignsQueryKeys.lists(),
        refetchType: "none",
      });

      // Clear only the exact snapshot submitted from this page.
      const store = useCampaignManagementStore.getState();
      if (store.draft === draft) store.resetDraft();
      if (!isCurrent(execution)) return;

      toast.success(execution.isLastOption ? "Campaign deleted" : "Proposal option deleted");

      if (execution.isLastOption) {
        changePhase("refreshing");
        try {
          await navigate(CAMPAIGNS_HREF, { replace: true });
        } catch {
          if (isCurrent(execution)) changePhase("navigation-error");
        }
        return;
      }

      if (!targetParams) return;
      changePhase("refreshing");
      execution.nextContextKey = JSON.stringify(targetParams);
      try {
        // The observer stays paused until the URL points at the recovery target.
        await navigate(optionHref, { replace: true });
        if (!isCurrent(execution)) return;
        // The app's nuqs React adapter does not observe Router replace-navigation.
        // Publish the target through nuqs too before enabling its query context.
        await synchronizeOptionIndex(0);
        if (isCurrent(execution)) setIsRecoveryQueryReady(true);
      } catch {
        if (isCurrent(execution)) changePhase("navigation-error");
      }
    } finally {
      execution.busy = false;
    }
  };

  const retryDeletedOptionRefresh = () => {
    const execution = executionRef.current;
    if (
      !execution || !isCurrent(execution) || execution.busy ||
      !execution.deleted || phaseRef.current !== "refresh-error"
    ) return;
    // Re-enable the same observer. Only its query function performs the GET.
    changePhase("refreshing");
  };

  return {
    isDeleteOptionModalOpen: phase === "confirm" || phase === "deleting",
    isDeletingOption: phase === "deleting",
    isDeleteFlowBusy: phase !== "idle",
    isDeleteRecoveryActive: phase === "refreshing" || phase === "refresh-error" || phase === "navigation-error",
    needsDeletedOptionRefresh: phase === "refresh-error",
    deletedOptionNavigationHref: phase === "navigation-error"
      ? executionRef.current?.isLastOption ? CAMPAIGNS_HREF : optionHref
      : null,
    willDeleteCampaign,
    isDeletedOptionRecovery: isRecoveryQueryReady,
    isDeletedOptionQueryEnabled:
      isRecoveryQueryReady && phase === "refreshing" && params?.optionIndex === 0,
    isDeletedOptionRecoveryCurrent,
    onDeletedOptionSnapshotApplied,
    onDeletedOptionRefreshError,
    isDeleteFlowBlocked: () => phaseRef.current !== "idle" || Boolean(executionRef.current?.busy || executionRef.current?.deleted),
    openDeleteOptionModal,
    closeDeleteOptionModal,
    confirmDeleteOption,
    retryDeletedOptionRefresh,
  };
};
