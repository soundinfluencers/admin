import { useLayoutEffect, useRef, useState } from "react";
import {
  useIsMutating,
  useQueryClient,
  type Mutation,
} from "@tanstack/react-query";

import {
  useAppendCampaignXlsxMutation,
} from "@/features/campaign-management/append-campaign-xlsx";
import type {
  useUpdateCampaignMutation,
} from "@/features/campaign-management/save-campaign";
import type {
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types";

import {
  useCampaignManagementStore,
} from "../store/campaign-management.store";
import {
  isSameCampaignContext,
  selectCampaignHasBaseline,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";

type Dialog = "import" | "unsaved" | null;

interface Execution {
  active: boolean;
  busy: boolean;
  contextKey: string;
  dialog: Dialog;
}

interface Options {
  params: ICampaignDetailsRequestParams | null;
  isUnavailable: () => boolean;
  saveCampaign: ReturnType<
    typeof useUpdateCampaignMutation
  >["mutateAsync"];
  discardDraft: () => void;
  synchronize: (
    params: ICampaignDetailsRequestParams,
  ) => Promise<void>;
}

const isConflictingMutation = (
  mutation: Mutation,
  campaignId: string | undefined,
): boolean => {
  if (!campaignId) return false;

  const variables = mutation.state.variables;

  if (!variables || typeof variables !== "object") {
    return false;
  }

  if (
    "params" in variables &&
    variables.params &&
    typeof variables.params === "object"
  ) {
    return (
      "campaignId" in variables.params &&
      variables.params.campaignId === campaignId
    );
  }

  return (
    "campaignId" in variables &&
    variables.campaignId === campaignId
  );
};

export const useAppendCampaignXlsxActions = ({
  params,
  isUnavailable,
  saveCampaign,
  discardDraft,
  synchronize,
}: Options) => {
  const queryClient = useQueryClient();
  const mutation = useAppendCampaignXlsxMutation(
    params?.campaignId ?? null,
  );

  const filters = {
    predicate: (entry: Mutation) =>
      isConflictingMutation(entry, params?.campaignId),
  };

  const conflictingCount = useIsMutating(filters);

  const [dialog, setDialog] = useState<Dialog>(null);
  const [isPreparingXlsx, setPreparing] = useState(false);

  const executionRef = useRef<Execution | null>(null);
  const contextKey = JSON.stringify(params);

  useLayoutEffect(() => {
    const execution: Execution = {
      active: true,
      busy: false,
      contextKey,
      dialog: null,
    };

    executionRef.current = execution;
    setDialog(null);
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
      state.draft.campaign.status !== "distributing" ||
      !isSameCampaignContext(state.draft.params, params) ||
      !selectCampaignHasBaseline(state)
    ) {
      return null;
    }

    return state;
  };

  const isCurrent = (execution: Execution): boolean =>
    execution.active &&
    execution.contextKey === contextKey &&
    executionRef.current === execution &&
    getCurrentState() !== null;

  const changeDialog = (
    execution: Execution,
    next: Dialog,
  ) => {
    if (!isCurrent(execution)) return;

    execution.dialog = next;
    setDialog(next);
  };

  const getAvailableExecution = () => {
    const execution = executionRef.current;

    if (
      !execution ||
      !isCurrent(execution) ||
      execution.busy ||
      mutation.getState().isPending ||
      isUnavailable() ||
      queryClient.isMutating(filters) > 0
    ) {
      return null;
    }

    return execution;
  };

  const renderedMutationId = mutation.getState().mutationId;

  const isXlsxActionBlocked = (): boolean => {
    const execution = executionRef.current;
    const network = mutation.getState();

    return Boolean(
      !execution?.active ||
      execution.contextKey !== contextKey ||
      execution.busy ||
      execution.dialog !== null ||
      network.mutationId !== renderedMutationId ||
      network.isPending ||
      network.needsCampaignRefresh,
    );
  };

  const requestXlsxImport = () => {
    const execution = getAvailableExecution();
    const state = getCurrentState();

    if (
      !execution ||
      !state ||
      execution.dialog !== null ||
      mutation.getState().needsCampaignRefresh
    ) {
      return;
    }

    changeDialog(
      execution,
      selectCampaignIsDirty(state) ? "unsaved" : "import",
    );
  };

  const prepareXlsxImport = async (
    choice: "save" | "discard",
  ) => {
    const execution = getAvailableExecution();
    const state = getCurrentState();

    if (
      !execution ||
      !state?.draft ||
      execution.dialog !== "unsaved" ||
      mutation.getState().needsCampaignRefresh
    ) {
      return;
    }

    execution.busy = true;
    setPreparing(true);

    try {
      if (selectCampaignIsDirty(state)) {
        if (choice === "save") {
          await saveCampaign({
            params: {
              ...state.draft.params,
              status: "distributing",
            },
            campaign: state.draft.campaign,
          });
        } else {
          discardDraft();
        }
      }

      const current = getCurrentState();

      if (
        !isCurrent(execution) ||
        !current ||
        selectCampaignIsDirty(current) ||
        isUnavailable() ||
        queryClient.isMutating(filters) > 0
      ) {
        return;
      }

      // preparation opens the picker; importing requires another click
      changeDialog(execution, "import");
    } catch {
      // save reports its own errors. Stay in Unsaved changes
    } finally {
      execution.busy = false;

      if (
        execution.active &&
        executionRef.current === execution
      ) {
        setPreparing(false);
      }
    }
  };

  const confirmXlsxImport = async (file: File) => {
    const execution = getAvailableExecution();
    const state = getCurrentState();

    if (
      !execution ||
      !state?.draft ||
      execution.dialog !== "import" ||
      mutation.getState().needsCampaignRefresh
    ) {
      return;
    }

    if (selectCampaignIsDirty(state)) {
      changeDialog(execution, "unsaved");
      return;
    }

    execution.busy = true;

    try {
      const result = await mutation.execute({
        params: state.draft.params,
        file,
        synchronize,
      });

      if (result !== null) {
        // a failed GET is recovered through the page warning
        changeDialog(execution, null);
      }
    } catch {
      // the feature reports POST errors. Keep the picker open
    } finally {
      execution.busy = false;
    }
  };

  const retryXlsxRefresh = async () => {
    const execution = getAvailableExecution();
    const state = getCurrentState();

    if (
      !execution ||
      !state?.draft ||
      !mutation.getState().needsCampaignRefresh
    ) {
      return;
    }

    execution.busy = true;

    try {
      await mutation.execute({
        params: state.draft.params,
        refreshOnly: true,
        synchronize,
      });
    } catch {
      // request notifications are handled by the feature
    } finally {
      execution.busy = false;
    }
  };

  const closeXlsxImport = () => {
    const execution = getAvailableExecution();

    if (execution?.dialog === "import") {
      changeDialog(execution, null);
    }
  };

  const cancelXlsxPreparation = () => {
    const execution = getAvailableExecution();

    if (execution?.dialog === "unsaved") {
      changeDialog(execution, null);
    }
  };

  const canImportXlsx = getCurrentState() !== null;

  const isXlsxLocked =
    isPreparingXlsx ||
    mutation.isAppendingCampaignXlsx ||
    mutation.needsCampaignRefresh;

  return {
    canImportXlsx,
    isImportXlsxDisabled:
      !canImportXlsx ||
      dialog !== null ||
      isXlsxLocked ||
      conflictingCount > 0 ||
      isUnavailable(),

    isImportXlsxModalOpen: dialog === "import",
    isXlsxUnsavedChangesModalOpen: dialog === "unsaved",
    isPreparingXlsx,
    isImportingXlsx: mutation.isAppendingCampaignXlsx,
    needsXlsxRefresh: mutation.needsCampaignRefresh,
    isXlsxLocked,
    isXlsxActionBlocked,

    isXlsxDialogActive: () =>
      executionRef.current?.dialog != null,

    requestXlsxImport,
    closeXlsxImport,
    cancelXlsxPreparation,
    confirmXlsxImport,
    retryXlsxRefresh,

    saveBeforeXlsxImport: () => {
      void prepareXlsxImport("save");
    },

    discardBeforeXlsxImport: () => {
      void prepareXlsxImport("discard");
    },
  };
};
