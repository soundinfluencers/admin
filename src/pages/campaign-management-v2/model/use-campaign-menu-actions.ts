import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type {
  ICampaignDetailsRequestParams,
} from "@/entities/campaign/model/campaign-details.types";

import type {
  useUpdateCampaignMutation,
} from "@/features/campaign-management/save-campaign";

import {
  useChangeCampaignStatusMutation,
  useDownloadCampaignPdfMutation,
} from "@/features/campaign-management/campaign-menu-actions";

import {
  useSendCampaignEmailMutation,
} from "@/features/campaign-management/send-campaign-email";

import {
  buildCampaignWhatsAppRequests,
  useSendCampaignWhatsAppMutation,
  type TCampaignWhatsAppAttempts,
  buildCampaignWhatsAppPreview,
  type CampaignWhatsAppPreview,
} from "@/features/campaign-management/send-campaign-whatsapp";

import type {
  ISendCampaignWhatsAppRequest,
} from "@/entities/campaign/model/campaign-whatsapp.types";

import { notifyUnhandledApiError } from "@/app/api/errors/notify";

import { toast } from "react-toastify";

import {
  useCampaignManagementStore,
} from "../store/campaign-management.store";

import {
  isSameCampaignContext,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";

interface UseCampaignMenuActionsParams {
  isActionUnavailable: () => boolean;
  params: ICampaignDetailsRequestParams | null;
  isSaving: boolean;
  canReset: boolean;
  resetDraft: () => void;
  saveCampaign: ReturnType<
    typeof useUpdateCampaignMutation
  >["mutateAsync"];
  onStatusChanged: () => void;
  synchronizeWhatsApp: (
    params: ICampaignDetailsRequestParams,
  ) => Promise<void>;
}

interface Execution {
  active: boolean;
  busy: boolean;
  statusChanged: boolean;
}

type MenuAction =
  | {
  type: "pdf" | "close" | "reopen" | "whatsapp";
}
  | {
  type: "message-preview";
  influencerId: string;
};

type ConfirmationAction = MenuAction;

type RunningAction = MenuAction["type"] | "message-send" | "email-send";

type Continuation = "current" | "save" | "discard";

export const useCampaignMenuActions = ({
  params,
  isSaving,
  canReset,
  resetDraft,
  saveCampaign,
  onStatusChanged,
  synchronizeWhatsApp,
  isActionUnavailable,
}: UseCampaignMenuActionsParams) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    mutateAsync: downloadPdf,
    isPending: isDownloadingPdf,
  } = useDownloadCampaignPdfMutation();

  const {
    mutateAsync: changeCampaignStatus,
    isPending: isStatusMutationPending,
  } = useChangeCampaignStatusMutation();

  const {
    mutateAsync: sendWhatsApp,
    isPending: isWhatsAppMutationPending,
    isRunning: isWhatsAppRunning,
  } = useSendCampaignWhatsAppMutation(
    params?.campaignId ?? null,
  );

  const {
    mutateAsync: sendEmail,
    isPending: isEmailMutationPending,
    isRunning: isEmailRunning,
  } = useSendCampaignEmailMutation(
    params?.campaignId ?? null,
  );

  const contextKey = JSON.stringify(
    params
      ? [
        params.campaignId,
        params.status,
        params.optionIndex ?? null,
      ]
      : null,
  );

  const [previousContextKey, setPreviousContextKey] =
    useState(contextKey);

  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction | null>(null);

  const [runningAction, setRunningAction] =
    useState<RunningAction | null>(null);

  const [statusTransitionHref, setStatusTransitionHref] =
    useState<string | null>(null);

  const [hasStatusTransitionError, setHasStatusTransitionError] =
    useState(false);

  const [whatsAppAttempts, setWhatsAppAttempts] =
    useState<TCampaignWhatsAppAttempts>({});

  const [messagePreview, setMessagePreview] =
    useState<CampaignWhatsAppPreview | null>(null);

  if (previousContextKey !== contextKey) {
    setPreviousContextKey(contextKey);
    setConfirmationAction(null);
    setRunningAction(null);
    setStatusTransitionHref(null);
    setHasStatusTransitionError(false);
    setWhatsAppAttempts({});
    setMessagePreview(null);
  }

  const executionRef = useRef<Execution | null>(null);

  useLayoutEffect(() => {
    const execution: Execution = {
      active: true,
      busy: false,
      statusChanged: false,
    };

    executionRef.current = execution;

    return () => {
      execution.active = false;
    };
  }, [contextKey]);

  const getCurrentState = () => {
    if (!params || params.status === "proposal") return null;

    const state = useCampaignManagementStore.getState();

    if (
      !state.draft ||
      !isSameCampaignContext(state.draft.params, params)
    ) {
      return null;
    }

    return state;
  };

  const getSavedCampaignForWhatsApp = () => {
    const baseline = getCurrentState()?.baseline;

    if (
      !baseline ||
      !params ||
      !isSameCampaignContext(baseline.params, params)
    ) {
      throw new Error(
        "Saved campaign data is unavailable for WhatsApp preparation",
      );
    }

    return baseline.campaign;
  };

  const isExecutionCurrent = (execution: Execution) =>
    execution.active &&
    executionRef.current === execution &&
    getCurrentState() !== null;

  const isMenuActionBlocked = () => {
    const execution = executionRef.current;

    return (
      !execution?.active ||
      execution.busy ||
      execution.statusChanged ||
      isSaving ||
      isDownloadingPdf ||
      isStatusMutationPending ||
      isWhatsAppRunning() ||
      isEmailRunning()
    );
  };

  const canSendWhatsApp = params?.status === "pending" || params?.status === "distributing";

  const executeWhatsAppRequests = async (
    requests: readonly ISendCampaignWhatsAppRequest[],
    execution: Execution,
  ) => {
    if (!params) {
      throw new Error("Campaign parameters are missing");
    }

    setWhatsAppAttempts((current) => ({
      ...current,
      ...Object.fromEntries(
        requests.map((request) => [
          request.influencerId,
          "sending" as const,
        ]),
      ),
    }));

    const result = await sendWhatsApp({
      params,
      requests,
      synchronize: synchronizeWhatsApp,

      onProgress: (influencerId, status) => {
        if (!isExecutionCurrent(execution)) return;

        setWhatsAppAttempts((current) => ({
          ...current,
          [influencerId]: status,
        }));
      },
    });

    if (isExecutionCurrent(execution)) {
      const recipientLabel =
        result.total === 1 ? "influencer" : "influencers";

      const summary =
        `WhatsApp: ${result.sent} sent, ` +
        `${result.failed} failed, ` +
        `${result.unknown} unknown ` +
        `(${result.total} ${recipientLabel}).`;

      const message = result.synchronized
        ? summary
        : `${summary} Could not refresh saved WhatsApp statuses.`;

      if (
        result.failed === 0 &&
        result.unknown === 0 &&
        result.synchronized
      ) {
        toast.success(message);
      } else if (result.failed === result.total) {
        toast.error(message);
      } else {
        toast.warning(message);
      }
    }

    return result;
  };

  const continueAction = async (
    action: MenuAction,
    continuation: Continuation,
  ) => {
    const execution = executionRef.current;
    const state = getCurrentState();

    if (
      !params ||
      !state?.draft ||
      !execution ||
      isMenuActionBlocked() ||
      isActionUnavailable()
    ) {
      return;
    }

    if (
      (action.type === "close" && params.status !== "distributing") ||
      (action.type === "reopen" && params.status !== "completed") ||
      (
        (
          action.type === "whatsapp" ||
          action.type === "message-preview"
        ) &&
        !canSendWhatsApp
      )
    ) {
      return;
    }

    execution.busy = true;

    const isStillCurrent = () => isExecutionCurrent(execution);

    try {
      if (
        action.type !== "reopen" &&
        selectCampaignIsDirty(state)
      ) {
        if (continuation === "current") {
          setConfirmationAction(action);
          return;
        }

        if (continuation === "save") {
          const status = params.status;

          if (
            status !== "pending" &&
            status !== "distributing"
          ) {
            return;
          }

          setRunningAction(action.type);

          await saveCampaign({
            params: {
              ...params,
              status,
            },
            campaign: state.draft.campaign,
          });
        } else {
          if (!canReset) return;

          resetDraft();
        }
      }

      if (!isStillCurrent()) return;

      setConfirmationAction(null);
      setRunningAction(action.type);

      if (action.type === "pdf") {
        await downloadPdf(params.campaignId);
        return;
      }

      if (
        action.type === "whatsapp" ||
        action.type === "message-preview"
      ) {
        const savedCampaign = getSavedCampaignForWhatsApp();

        if (action.type === "message-preview") {
          const preview = buildCampaignWhatsAppPreview(
            params.campaignId,
            savedCampaign,
            action.influencerId,
          );

          setMessagePreview(preview);
          return;
        }

        const requests = buildCampaignWhatsAppRequests(
          params.campaignId,
          savedCampaign,
        );

        if (requests.length === 0) return;

        await executeWhatsAppRequests(requests, execution);
        return;
      }

      await changeCampaignStatus({
        campaignId: params.campaignId,
        action: action.type,
      });
      
      execution.statusChanged = true;
      
      if (!isStillCurrent()) return;

      const nextStatus =
        action.type === "close" ? "completed" : "distributing";

      const search = new URLSearchParams(location.search);
      search.delete("proposal-option");

      const query = search.toString();

      const pathname =
        `/dashboard/campaigns/campaign-management/` +
        `${nextStatus}/${encodeURIComponent(params.campaignId)}`;

      const href = query ? `${pathname}?${query}` : pathname;

      setStatusTransitionHref(href);
      onStatusChanged();

      await navigate(href, { replace: true });
    } catch (error) {
      if (execution.statusChanged && isStillCurrent()) {
        setHasStatusTransitionError(true);
      }

      notifyUnhandledApiError(error);
    } finally {
      execution.busy = false;

      if (
        execution.active &&
        executionRef.current === execution
      ) {
        setRunningAction(null);
      }
    }
  };

  const requestAction = (action: MenuAction) => {
    if (confirmationAction !== null || messagePreview !== null) {
      return;
    }

    void continueAction(action, "current");
  };

  const cancelMenuAction = () => {
    if (isMenuActionBlocked()) return;

    setConfirmationAction(null);
  };

  const saveAndContinueMenuAction = () => {
    if (confirmationAction === null) return;

    void continueAction(confirmationAction, "save");
  };

  const discardAndContinueMenuAction = () => {
    if (confirmationAction === null) return;

    void continueAction(confirmationAction, "discard");
  };

  const closeMessagePreview = () => {
    if (isMenuActionBlocked()) return;

    setMessagePreview(null);
  };

  const sendMessagePreview = async () => {
    const execution = executionRef.current;
    const preview = messagePreview;

    if (
      !preview ||
      !execution ||
      !canSendWhatsApp ||
      !isExecutionCurrent(execution) ||
      isMenuActionBlocked() ||
      isActionUnavailable()
    ) {
      return;
    }

    execution.busy = true;
    setRunningAction("message-send");

    try {
      const result = await executeWhatsAppRequests(
        [preview.request],
        execution,
      );

      if (
        isExecutionCurrent(execution) &&
        result.sent === 1
      ) {
        setMessagePreview(null);
      }
    } catch (error) {
      if (isExecutionCurrent(execution)) {
        notifyUnhandledApiError(error);
      }
    } finally {
      execution.busy = false;

      if (
        execution.active &&
        executionRef.current === execution
      ) {
        setRunningAction(null);
      }
    }
  };

  const sendEmailPreview = async () => {
    const execution = executionRef.current;
    const preview = messagePreview;

    if (
      !preview ||
      !execution ||
      !canSendWhatsApp ||
      !isExecutionCurrent(execution) ||
      isMenuActionBlocked() ||
      isActionUnavailable()
    ) {
      return;
    }

    execution.busy = true;
    setRunningAction("email-send");

    try {
      const promoId = preview.data.placements[0]?.addedAccountsId;

      if (!promoId) {
        notifyUnhandledApiError(
          new Error("Campaign placement is unavailable for Email sending"),
        );
        return;
      }

      await sendEmail({
        campaignId: preview.request.campaignId,
        promoId,
      });

      if (!isExecutionCurrent(execution)) return;

      toast.success("Email request completed.");
      setMessagePreview(null);
    } catch (error) {
      if (isExecutionCurrent(execution)) {
        notifyUnhandledApiError(error);
      }
    } finally {
      execution.busy = false;

      if (
        execution.active &&
        executionRef.current === execution
      ) {
        setRunningAction(null);
      }
    }
  };

  const isChangingCampaignStatus =
    runningAction === "close" ||
    runningAction === "reopen" ||
    isStatusMutationPending;

  const isSendingWhatsApp =
    runningAction === "whatsapp" ||
    runningAction === "message-send" ||
    isWhatsAppMutationPending;

  const isMenuBusy =
    isSaving ||
    isDownloadingPdf ||
    runningAction !== null ||
    isStatusMutationPending ||
    isWhatsAppMutationPending ||
    statusTransitionHref !== null ||
    confirmationAction !== null ||
    isEmailMutationPending ||
    messagePreview !== null;

  const isSendingEmail =
    runningAction === "email-send" ||
    isEmailMutationPending;

  return {
    isDownloadingPdf,
    isChangingCampaignStatus,
    isMenuBusy,
    canSendWhatsApp,
    isSendingWhatsApp,
    whatsAppAttempts,
    isSendingEmail,
    statusTransitionHref: hasStatusTransitionError
      ? statusTransitionHref
      : null,

    isMenuConfirmationOpen:
      confirmationAction !== null &&
      confirmationAction.type !== "message-preview",

    isMessageConfirmationOpen:
      confirmationAction?.type === "message-preview",

    canCloseCampaign: params?.status === "distributing",
    canReopenCampaign: params?.status === "completed",

    requestPdfDownload: () =>
      requestAction({ type: "pdf" }),

    requestCloseCampaign: () =>
      requestAction({ type: "close" }),

    requestReopenCampaign: () =>
      requestAction({ type: "reopen" }),

    requestWhatsAppSend: () =>
      requestAction({ type: "whatsapp" }),

    requestMessagePreview: (influencerId: string) =>
      requestAction({
        type: "message-preview",
        influencerId,
      }),

    sendEmailPreview: () => {
      void sendEmailPreview();
    },

    messagePreview,
    closeMessagePreview,

    sendMessagePreview: () => {
      void sendMessagePreview();
    },

    cancelMenuAction,
    saveAndContinueMenuAction,
    discardAndContinueMenuAction,
    isMenuActionBlocked: () =>
      isMenuActionBlocked() ||
      confirmationAction !== null ||
      messagePreview !== null,
  };
};
