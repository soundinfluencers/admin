import { createElement, useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notifyUnhandledApiError } from "@/app/api/errors/notify.ts";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys.ts";
import {
  mapCampaignToProposalOptionBody,
  useCreateProposalOption,
} from "@/features/campaign-management/create-proposal-option";
import type { useUpdateCampaignMutation } from "@/features/campaign-management/save-campaign";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";
import {
  isSameCampaignContext,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";
import type {
  ICampaignDetails,
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types.ts";

type TProposalAction =
  | { type: "copy" }
  | { type: "switch"; optionIndex: number };

type TProposalDialog =
  | { type: "create" }
  | { type: "confirm"; action: TProposalAction }
  | null;

type TProposalExecution = {
  params: ICampaignDetailsRequestParams | null;
  generation: number;
  active: boolean;
};

type TProposalOptionActionsParams = {
  params: ICampaignDetailsRequestParams | null;
  canReset: boolean;
  isSaving: boolean;
  resetDraft: () => void;
  saveCampaign: ReturnType<typeof useUpdateCampaignMutation>["mutateAsync"];
  setOptionIndex: (optionIndex: number) => Promise<URLSearchParams>;
};

export const useProposalOptionActions = ({
  params,
  canReset,
  isSaving,
  resetDraft,
  saveCampaign,
  setOptionIndex,
}: TProposalOptionActionsParams) => {
  const queryClient = useQueryClient();
  const [proposalDialog, setProposalDialog] = useState<TProposalDialog>(null);
  const [proposalDialogContext, setProposalDialogContext] = useState(params);

  if (proposalDialogContext !== params) {
    setProposalDialogContext(params);
    setProposalDialog(null);
  }

  const proposalExecutionRef = useRef<TProposalExecution | null>(null);

  useLayoutEffect(() => {
    const execution: TProposalExecution = {
      params,
      generation: (proposalExecutionRef.current?.generation ?? 0) + 1,
      active: true,
    };

    proposalExecutionRef.current = execution;

    return () => {
      execution.active = false;
    };
  }, [params]);

  const {
    mutateAsync: createProposalOption,
    isPending: isCreatingOption,
  } = useCreateProposalOption();

  const getCurrentProposalDraft = (
    execution = proposalExecutionRef.current,
  ) => {
    const currentDraft = useCampaignManagementStore.getState().draft;

    if (
      !params ||
      params.status !== "proposal" ||
      !execution?.active ||
      execution !== proposalExecutionRef.current ||
      !execution.params ||
      !isSameCampaignContext(execution.params, params) ||
      !currentDraft ||
      !isSameCampaignContext(currentDraft.params, params)
    ) {
      return null;
    }

    return currentDraft;
  };

  const reportProposalNavigationError = (
    execution: TProposalExecution,
    targetCampaignId: string,
    targetOptionIndex: number,
    wasCreated: boolean,
    navigationAttempted: boolean,
  ) => {
    const currentExecution = proposalExecutionRef.current;
    // nuqs changes local state optimistically, even if writing the URL fails.
    const isAttemptedTarget =
      navigationAttempted &&
      currentExecution?.active &&
      currentExecution.generation === execution.generation + 1 &&
      currentExecution.params?.campaignId === targetCampaignId &&
      currentExecution.params.status === "proposal" &&
      currentExecution.params.optionIndex === targetOptionIndex;

    if (!getCurrentProposalDraft(execution) && !isAttemptedTarget) return;

    const href =
      `/dashboard/campaigns/campaign-management/proposal/${encodeURIComponent(targetCampaignId)}` +
      `?proposal-option=${targetOptionIndex}`;

    toast.error(
      createElement(
        "div",
        null,
        wasCreated
          ? "Proposal option was created, but opening it failed. "
          : "Could not open the selected proposal option. ",
        // A full navigation retries only opening/GET, never Save or POST.
        createElement("a", { href }, "Open proposal option"),
      ),
      { autoClose: false },
    );
  };

  const openCreateOptionModal = () => {
    if (isSaving || isCreatingOption || !getCurrentProposalDraft()) {
      return;
    }

    setProposalDialog({ type: "create" });
  };

  const closeCreateOptionModal = () => {
    if (isCreatingOption) return;

    setProposalDialog(null);
  };

  const executeProposalAction = async (
    action: TProposalAction,
    sourceCampaign: ICampaignDetails,
    execution = proposalExecutionRef.current,
  ) => {
    const currentDraft = getCurrentProposalDraft(execution);

    if (!currentDraft || !execution) return;

    if (action.type === "switch") {
      setProposalDialog(null);
      try {
        await setOptionIndex(action.optionIndex);
      } catch {
        reportProposalNavigationError(
          execution, currentDraft.params.campaignId, action.optionIndex, false, true,
        );
      }
      return;
    }

    setProposalDialog({ type: "create" });

    let createdOption: Awaited<ReturnType<typeof createProposalOption>>;

    try {
      const body = mapCampaignToProposalOptionBody(sourceCampaign);

      createdOption = await createProposalOption({
        campaignId: currentDraft.params.campaignId,
        body,
      });
    } catch (error) {
      if (!getCurrentProposalDraft(execution)) return;

      notifyUnhandledApiError(error);

      return;
    }

    let navigationAttempted = false;

    try {
      // Completed writes may invalidate their cache after this page has left.
      await queryClient.invalidateQueries({
        queryKey: [
          ...campaignsQueryKeys.details(),
          {
            campaignId: createdOption.campaignId,
            status: "proposal",
          },
        ],
        refetchType: "none",
      });

      await queryClient.invalidateQueries({
        queryKey: campaignsQueryKeys.lists(),
        refetchType: "none",
      });

      if (!getCurrentProposalDraft(execution)) return;

      setProposalDialog(null);

      navigationAttempted = true;
      await setOptionIndex(createdOption.optionIndex);
    } catch {
      reportProposalNavigationError(
        execution, createdOption.campaignId, createdOption.optionIndex, true, navigationAttempted,
      );
    }
  };

  const requestProposalAction = (action: TProposalAction) => {
    if (isSaving || isCreatingOption) return;

    const currentDraft = getCurrentProposalDraft();

    if (!currentDraft) return;

    if (
      action.type === "switch" &&
      action.optionIndex === currentDraft.params.optionIndex
    ) {
      return;
    }

    const state = useCampaignManagementStore.getState();

    if (selectCampaignIsDirty(state)) {
      setProposalDialog({
        type: "confirm",
        action,
      });

      return;
    }

    void executeProposalAction(action, currentDraft.campaign);
  };

  const cancelProposalAction = () => {
    if (
      isSaving ||
      isCreatingOption ||
      proposalDialog?.type !== "confirm"
    ) {
      return;
    }

    setProposalDialog(
      proposalDialog.action.type === "copy"
        ? { type: "create" }
        : null,
    );
  };

  const saveAndContinueProposalAction = async () => {
    if (
      isSaving ||
      isCreatingOption ||
      proposalDialog?.type !== "confirm"
    ) {
      return;
    }

    const execution = proposalExecutionRef.current;
    const currentDraft = getCurrentProposalDraft(execution);

    if (!currentDraft || !execution) return;

    const action = proposalDialog.action;
    let savedCampaign: ICampaignDetails;

    try {
      savedCampaign = await saveCampaign({
        params: {
          ...currentDraft.params,
          status: "proposal",
        },
        campaign: currentDraft.campaign,
      });
    } catch {
      // The Save mutation reports preparation and unhandled request errors.
      // A failed Save must stop Copy/Switch, regardless of the current context.
      return;
    }

    if (!getCurrentProposalDraft(execution)) return;

    if (action.type === "copy") {
      setProposalDialog({ type: "create" });
      return;
    }

    await executeProposalAction(action, savedCampaign, execution);
  };

  const discardAndContinueProposalAction = () => {
    if (
      isSaving ||
      isCreatingOption ||
      proposalDialog?.type !== "confirm" ||
      !canReset
    ) {
      return;
    }

    if (!getCurrentProposalDraft()) return;

    const action = proposalDialog.action;

    resetDraft();

    const restoredDraft = getCurrentProposalDraft();

    if (!restoredDraft) return;

    if (action.type === "copy") {
      setProposalDialog({ type: "create" });
      return;
    }
    
    void executeProposalAction(action, restoredDraft.campaign);
  };

  return {
    isCreatingOption,
    isCreateOptionModalOpen: proposalDialog?.type === "create",
    isUnsavedChangesModalOpen: proposalDialog?.type === "confirm",

    proposalUnsavedChangesDescription:
      proposalDialog?.type === "confirm" &&
      proposalDialog.action.type === "copy"
        ? "Save or discard your changes before creating a copy. " +
        "You will return to the creation dialog. " +
        "The copy will not be created automatically."
        : undefined,

    openCreateOptionModal,
    closeCreateOptionModal,
    cancelProposalAction,
    saveAndContinueProposalAction,
    discardAndContinueProposalAction,

    createProposalCopy: () => requestProposalAction({ type: "copy" }),

    changeProposalOption: (nextOptionIndex: number) =>
      requestProposalAction({
        type: "switch",
        optionIndex: nextOptionIndex,
      }),
  };
};
