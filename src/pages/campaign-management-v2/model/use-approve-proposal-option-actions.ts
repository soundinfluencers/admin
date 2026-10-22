import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type {
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types";

import type {
  useUpdateCampaignMutation,
} from "@/features/campaign-management/save-campaign";

import {
  useApproveProposalOptionMutation,
} from "@/features/campaign-management/approve-proposal-option";

import {
  useCampaignManagementStore,
} from "../store/campaign-management.store";

import {
  isSameCampaignContext,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";

type Dialog = "approve" | "unsaved" | null;

type Execution = {
  active: boolean;
  busy: boolean;
  approved: boolean;
};

interface Options {
  params: ICampaignDetailsRequestParams | null;
  isSaving: boolean;
  isUnavailable: boolean;
  canReset: boolean;
  resetDraft: () => void;
  saveCampaign: ReturnType<typeof useUpdateCampaignMutation>["mutateAsync"];
}

export const useApproveProposalOptionActions = ({
  params,
  isSaving,
  isUnavailable,
  canReset,
  resetDraft,
  saveCampaign,
}: Options) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    mutateAsync: approveOption,
    isPending: isApprovingOption,
  } = useApproveProposalOptionMutation();

  const contextKey = JSON.stringify(
    params
      ? [params.campaignId, params.status, params.optionIndex ?? null]
      : null,
  );

  const [previousContextKey, setPreviousContextKey] = useState(contextKey);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [isPreparingApproval, setIsPreparingApproval] = useState(false);
  const [transitionHref, setTransitionHref] = useState<string | null>(null);
  const [navigationFailed, setNavigationFailed] = useState(false);

  const dialogRef = useRef<Dialog>(null);
  const executionRef = useRef<Execution | null>(null);

  if (previousContextKey !== contextKey) {
    setPreviousContextKey(contextKey);
    setDialog(null);
    dialogRef.current = null;
    setIsPreparingApproval(false);
    setTransitionHref(null);
    setNavigationFailed(false);
  }

  useLayoutEffect(() => {
    const execution: Execution = {
      active: true,
      busy: false,
      approved: false,
    };

    executionRef.current = execution;

    return () => {
      execution.active = false;
    };
  }, [contextKey]);

  const changeDialog = (next: Dialog) => {
    dialogRef.current = next;
    setDialog(next);
  };

  const getCurrentState = () => {
    const state = useCampaignManagementStore.getState();

    if (
      !params ||
      params.status !== "proposal" ||
      !Number.isInteger(params.optionIndex) ||
      (params.optionIndex ?? -1) < 0 ||
      !state.draft ||
      !isSameCampaignContext(state.draft.params, params)
    ) {
      return null;
    }

    return state;
  };

  const isCurrent = (execution: Execution) =>
    execution.active &&
    executionRef.current === execution &&
    getCurrentState() !== null;

  const getAvailableExecution = () => {
    const execution = executionRef.current;

    if (
      !execution ||
      !isCurrent(execution) ||
      execution.busy ||
      execution.approved ||
      isSaving ||
      isUnavailable ||
      isApprovingOption
    ) {
      return null;
    }

    return execution;
  };

  const openApproveOptionModal = () => {
    if (!getAvailableExecution() || dialogRef.current !== null) return;

    changeDialog("approve");
  };

  const closeApproveOptionModal = () => {
    if (!getAvailableExecution()) return;

    changeDialog(null);
  };

  const cancelApprovePreparation = () => {
    if (
      !getAvailableExecution() ||
      dialogRef.current !== "unsaved"
    ) {
      return;
    }

    changeDialog("approve");
  };

  const saveBeforeApprove = async () => {
    const execution = getAvailableExecution();
    const state = getCurrentState();

    if (
      !execution ||
      !state?.draft ||
      dialogRef.current !== "unsaved"
    ) {
      return;
    }

    execution.busy = true;
    setIsPreparingApproval(true);

    try {
      if (selectCampaignIsDirty(state)) {
        await saveCampaign({
          params: {
            ...state.draft.params,
            status: "proposal",
          },
          campaign: state.draft.campaign,
        });
      }

      if (isCurrent(execution)) {
        changeDialog("approve");
      }
    } catch {
      // Save reports its own errors. Stay in Unsaved changes.
    } finally {
      execution.busy = false;

      if (
        execution.active &&
        executionRef.current === execution
      ) {
        setIsPreparingApproval(false);
      }
    }
  };

  const discardBeforeApprove = () => {
    const execution = getAvailableExecution();

    if (
      !execution ||
      !canReset ||
      dialogRef.current !== "unsaved"
    ) {
      return;
    }

    resetDraft();

    if (isCurrent(execution)) {
      changeDialog("approve");
    }
  };

  const confirmApproveOption = async () => {
    const execution = getAvailableExecution();
    const state = getCurrentState();

    if (
      !execution ||
      !state?.draft ||
      dialogRef.current !== "approve"
    ) {
      return;
    }

    if (selectCampaignIsDirty(state)) {
      changeDialog("unsaved");
      return;
    }

    const { campaignId, optionIndex } = state.draft.params;

    if (optionIndex === undefined) return;

    execution.busy = true;

    try {
      let result: Awaited<ReturnType<typeof approveOption>>;

      try {
        result = await approveOption({
          campaignId,
          optionIndex,
        });
      } catch {
        // The mutation reports request errors. Allow an explicit retry.
        return;
      }

      execution.approved = true;

      if (!isCurrent(execution)) return;

      const search = new URLSearchParams(location.search);
      search.delete("proposal-option");

      const query = search.toString();

      const pathname =
        `/dashboard/campaigns/campaign-management/pending/` +
        encodeURIComponent(result.campaignId);

      const href = query ? `${pathname}?${query}` : pathname;

      setTransitionHref(href);
      changeDialog(null);

      try {
        await navigate(href, { replace: true });
      } catch {
        if (isCurrent(execution)) {
          setNavigationFailed(true);
        }
      }
    } finally {
      execution.busy = false;
    }
  };

  const isApproveFlowBlocked = () =>
    dialogRef.current !== null ||
    Boolean(
      executionRef.current?.busy ||
      executionRef.current?.approved,
    );

  return {
    isApproveOptionModalOpen: dialog === "approve",
    isApproveUnsavedChangesModalOpen: dialog === "unsaved",

    isApproveFlowBusy:
      dialog !== null ||
      isPreparingApproval ||
      isApprovingOption ||
      transitionHref !== null,

    isPreparingApproval,
    isApprovingOption,

    approveTransitionHref: navigationFailed ? transitionHref : null,

    proposalApproveUnsavedChangesDescription: 
      "Save or discard your changes before approving this option. " + 
      "You will return to the confirmation dialog. " +
      "The option will not be approved automatically.",


    isApproveFlowBlocked,
    isApproveDialogActive: () => dialogRef.current !== null,

    openApproveOptionModal,
    closeApproveOptionModal,
    cancelApprovePreparation,
    saveBeforeApprove,
    discardBeforeApprove,
    confirmApproveOption,
  };
};
