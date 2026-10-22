import { useLayoutEffect, useRef, useState } from "react";
import { useIsMutating, useQueryClient, type Mutation } from "@tanstack/react-query";
import { useUpdateCampaignInsightsMutation } from "@/features/campaign-management/update-campaign-insights";
import type { useUpdateCampaignMutation } from "@/features/campaign-management/save-campaign";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types";
import { useCampaignManagementStore } from "../store/campaign-management.store";
import {
  isSameCampaignContext,
  selectCampaignHasBaseline,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";

interface Execution {
  active: boolean;
  busy: boolean;
  dialog: boolean;
}

interface Options {
  params: ICampaignDetailsRequestParams | null;
  isUnavailable: () => boolean;
  saveCampaign: ReturnType<typeof useUpdateCampaignMutation>["mutateAsync"];
  discardDraft: () => void;
  synchronize: (params: ICampaignDetailsRequestParams) => Promise<void>;
}

const isConflictingMutation = (mutation: Mutation, campaignId: string | undefined) => {
  if (!campaignId) return false;
  // Existing Save/status mutations do not all have keys; their variables identify the campaign.
  const variables = mutation.state.variables;
  if (!variables || typeof variables !== "object") return false;
  if ("params" in variables && variables.params && typeof variables.params === "object") {
    return "campaignId" in variables.params && variables.params.campaignId === campaignId;
  }
  return "campaignId" in variables && variables.campaignId === campaignId;
};

export const useUpdateCampaignInsightsActions = ({
  params,
  isUnavailable,
  saveCampaign,
  discardDraft,
  synchronize,
}: Options) => {
  const queryClient = useQueryClient();
  const mutation = useUpdateCampaignInsightsMutation(params?.campaignId ?? null);
  const filters = {
    predicate: (entry: Mutation) => isConflictingMutation(entry, params?.campaignId),
  };
  const conflictingCount = useIsMutating(filters);
  const [dialog, setDialog] = useState(false);
  const [isPreparingInsights, setPreparing] = useState(false);
  const executionRef = useRef<Execution | null>(null);
  const contextKey = JSON.stringify(params);

  useLayoutEffect(() => {
    const execution = { active: true, busy: false, dialog: false };
    executionRef.current = execution;
    setDialog(false);
    setPreparing(false);
    return () => {
      execution.active = false;
    };
  }, [contextKey]);

  const getCurrentState = () => {
    const state = useCampaignManagementStore.getState();
    if (
      !params ||
      params.status !== "distributing" ||
      !state.draft ||
      state.draft.params.status !== "distributing" ||
      !isSameCampaignContext(state.draft.params, params) ||
      !selectCampaignHasBaseline(state)
    ) return null;
    return state;
  };

  // Callbacks retained by pre-refresh editors must not write their old values after unlock.
  const renderedMutationId = mutation.getState().mutationId;
  const isInsightsActionBlocked = () => {
    const state = mutation.getState();
    return Boolean(
      !executionRef.current?.active || state.mutationId !== renderedMutationId ||
      executionRef.current?.busy || executionRef.current?.dialog ||
      state.isPending || state.needsInsightsRefresh,
    );
  };

  const continueInsights = async (continuation: "current" | "save" | "discard") => {
    const execution = executionRef.current;
    const state = getCurrentState();
    const network = mutation.getState();
    if (
      !params || !state?.draft || !execution?.active || execution.busy ||
      network.isPending || network.needsInsightsRefresh ||
      isUnavailable() || queryClient.isMutating(filters) > 0
    ) return;
    if (continuation !== "current" && !execution.dialog) return;
    if (continuation === "current" && execution.dialog) return;

    if (continuation === "current" && selectCampaignIsDirty(state)) {
      execution.dialog = true;
      setDialog(true);
      return;
    }

    execution.busy = true;
    setPreparing(true);
    try {
      if (selectCampaignIsDirty(state)) {
        if (continuation === "save") {
          await saveCampaign({
            params: { ...params, status: "distributing" },
            campaign: state.draft.campaign,
          });
        } else {
          discardDraft();
        }
      }

      const current = getCurrentState();
      if (
        !execution.active || executionRef.current !== execution || !current?.draft ||
        selectCampaignIsDirty(current) || isUnavailable() || queryClient.isMutating(filters) > 0
      ) return;

      execution.dialog = false;
      setDialog(false);
      await mutation.execute({
        params: current.draft.params,
        campaignName: current.draft.campaign.campaignName,
        synchronize,
      });
    } catch {
      // Save and the feature report their own errors; never continue after a failed Save.
    } finally {
      execution.busy = false;
      if (execution.active && executionRef.current === execution) setPreparing(false);
    }
  };

  const retryInsightsRefresh = async () => {
    const execution = executionRef.current;
    const current = getCurrentState();
    const network = mutation.getState();
    if (
      !execution?.active || execution.busy || !current?.draft || !network.needsInsightsRefresh ||
      network.isPending || isUnavailable() || queryClient.isMutating(filters) > 0
    ) return;
    execution.busy = true;
    try {
      await mutation.execute({
        params: current.draft.params,
        campaignName: current.draft.campaign.campaignName,
        refreshOnly: true,
        synchronize,
      });
    } finally {
      execution.busy = false;
    }
  };

  const canUpdateInsights = getCurrentState() !== null;
  const isInsightsLocked = isPreparingInsights || mutation.isUpdatingInsights || mutation.needsInsightsRefresh;

  return {
    canUpdateInsights,
    isUpdateInsightsDisabled:
      !canUpdateInsights || dialog || isInsightsLocked || conflictingCount > 0 || isUnavailable(),
    isUpdatingInsights: mutation.isUpdatingInsights,
    needsInsightsRefresh: mutation.needsInsightsRefresh,
    isPreparingInsights,
    isInsightsLocked,
    isInsightsActionBlocked,
    isInsightsUnsavedChangesModalOpen: dialog,
    requestUpdateInsights: () => {
      void continueInsights("current");
    },
    saveAndContinueInsights: () => {
      void continueInsights("save");
    },
    discardAndContinueInsights: () => {
      void continueInsights("discard");
    },
    cancelInsightsPreparation: () => {
      const execution = executionRef.current;
      if (!execution?.active || execution.busy) return;
      execution.dialog = false;
      setDialog(false);
    },
    retryInsightsRefresh: () => {
      void retryInsightsRefresh();
    },
  };
};
