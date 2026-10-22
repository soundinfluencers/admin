import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { useUpdateCampaignMutation } from "@/features/campaign-management/save-campaign";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys.ts";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";
import { selectCurrentFollowers } from "../store/campaign-management.selectors.ts";
import { isCampaignStatus } from "./url-path-helpers.ts";
import { useCampaignDraft } from "./use-campaign-draft.ts";
import { useProposalOptionActions } from "./use-proposal-option-actions.ts";
import { useDeleteProposalOptionActions } from "./use-delete-proposal-option-actions.ts";
import { useApproveProposalOptionActions } from "./use-approve-proposal-option-actions";
import { useCampaignMenuActions } from "./use-campaign-menu-actions";
import { useUpdateCampaignInsightsActions } from "./use-update-campaign-insights-actions";
import { useAppendCampaignXlsxActions } from "./use-append-campaign-xlsx-actions";
import { applyPromoPaidToCampaign } from "@/entities/campaign/model/apply-promo-paid-to-campaign.ts";
import { applyWhatsAppUpdatesToCampaign, } from "@/entities/campaign/model/apply-whatsapp-updates-to-campaign";
import { getCampaignById } from "@/entities/campaign";
import type { TCampaignManagementDraft } from "../store/campaign-management-store.types";

import {
  isSameCampaignContext,
  selectCampaignHasBaseline,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";

import { CAMPAIGN_VIEW, CAMPAIGN_VIEWS } from "@/shared/constants/campaign-view.ts";

import type { TCampaignWhatsAppAccountUpdate, } from "@/entities/campaign/model/campaign-whatsapp.types";
import type {
  ICampaignDetails,
  ICampaignDetailsRequestParams,
  IMarkPromoPaidResponse,
} from "@/entities/campaign/model/campaign-details.types.ts";

interface UseCampaignManagementStateOptions {
  onCampaignStatusChanged: () => void;
}

export const useCampaignManagementState = ({
  onCampaignStatusChanged,
}: UseCampaignManagementStateOptions) => {
  const queryClient = useQueryClient();

  const { campaignId, status } = useParams<"campaignId" | "status">();

  const [optionIndex, setOptionIndex] = useQueryState(
    "proposal-option",
    parseAsInteger.withDefault(0),
  );

  const [urlView, setView] = useQueryState(
    "tab",
    parseAsStringLiteral(CAMPAIGN_VIEWS).withDefault(
      CAMPAIGN_VIEW.strategy,
    ),
  );

  const [editorRevision, setEditorRevision] = useState(0);

  const params = useMemo<ICampaignDetailsRequestParams | null>(() => {
    if (!campaignId || !isCampaignStatus(status)) return null;

    return {
      campaignId,
      status,
      ...(status === "proposal" && { optionIndex }),
    }
  }, [campaignId, status, optionIndex]);

  // These callbacks run on user actions, after all action hooks are initialized.
  const deleteActions = useDeleteProposalOptionActions({
    params,
    onSnapshotApplied: () => resetEditors(),
    synchronizeOptionIndex: (nextOptionIndex) => setOptionIndex(nextOptionIndex, {
      history: "replace",
      clearOnDefault: false,
    }),
    isUnavailable: () =>
      isSaving ||
      proposalActions.isCreatingOption ||
      proposalActions.isCreateOptionModalOpen ||
      proposalActions.isUnsavedChangesModalOpen ||
      approveActions.isApproveFlowBusy ||
      menuActions.isMenuBusy ||
      insightsActions.isInsightsLocked ||
      insightsActions.isInsightsUnsavedChangesModalOpen ||
      xlsxActions.isXlsxLocked ||
      xlsxActions.isImportXlsxModalOpen ||
      xlsxActions.isXlsxUnsavedChangesModalOpen,
  });

  const {
    campaign,
    isCurrentDraft,
    isInvalidParams,
    isPending,
    isError,
    error,
  } = useCampaignDraft(
    params,
    !deleteActions.isDeleteFlowBusy || deleteActions.isDeletedOptionQueryEnabled,
    deleteActions.isDeletedOptionRecovery ? {
      isCurrent: deleteActions.isDeletedOptionRecoveryCurrent,
      onSnapshotApplied: deleteActions.onDeletedOptionSnapshotApplied,
      onError: deleteActions.onDeletedOptionRefreshError,
    } : undefined,
  );

  const hasBaseline = useCampaignManagementStore(selectCampaignHasBaseline);
  const isDraftDirty = useCampaignManagementStore(selectCampaignIsDirty);
  const currentFollowers = useCampaignManagementStore(selectCurrentFollowers);
  const restoreBaseline = useCampaignManagementStore((state) => state.restoreBaseline);
  const applySavedCampaign = useCampaignManagementStore((state) => state.applySavedCampaign);
  const updateCampaignName = useCampaignManagementStore((state) => state.updateCampaignName);
  const setPriceHidden = useCampaignManagementStore((state) => state.setPriceHidden);
  const setCpmAndResultHidden = useCampaignManagementStore((state) => state.setCpmAndResultHidden);
  const setDisplayCurrency = useCampaignManagementStore((state) => state.setDisplayCurrency);
  const setPrice = useCampaignManagementStore((state) => state.setCampaignPrice);
  const setAccountSelectedContent = useCampaignManagementStore((state) => state.setAccountSelectedContent);
  const onCreateContentForAccount = useCampaignManagementStore((state) => state.createContentForAccount);
  const setAccountSelectedDescription = useCampaignManagementStore((state) => state.setAccountSelectedDescription);
  const setAccountSelectedBrief = useCampaignManagementStore((state) => state.setAccountSelectedBrief);
  const onCreateDescriptionForAccount = useCampaignManagementStore((state) => state.createDescriptionForAccount);
  const onCreateBriefForAccount = useCampaignManagementStore((state) => state.createBriefForAccount);
  const onUpdateDescriptionForAccount = useCampaignManagementStore((state) => state.updateContentDescription);
  const onUpdateBriefForAccount = useCampaignManagementStore((state) => state.updateContentBrief);
  const deleteContentDescription = useCampaignManagementStore((state) => state.deleteContentDescription);
  const deleteContentBrief = useCampaignManagementStore((state) => state.deleteContentBrief);
  const onUpdateContentTaggedUser = useCampaignManagementStore((state) => state.updateContentTaggedUser);
  const onUpdateContentTaggedLink = useCampaignManagementStore((state) => state.updateContentTaggedLink);
  const setAccountDateRequest = useCampaignManagementStore((state) => state.setAccountDateRequest);
  const setAccountPostLink = useCampaignManagementStore((state) => state.setAccountPostLink);
  const setAccountScreenshot = useCampaignManagementStore((state) => state.setAccountScreenshot);
  const onUpdateAccountMetricField = useCampaignManagementStore((state) => state.setAccountMetricField);
  const applyPromoPaid = useCampaignManagementStore((state) => state.applyPromoPaid);
  const applyWhatsAppUpdates = useCampaignManagementStore((state) => state.applyWhatsAppUpdates);
  const deleteCampaignContent = useCampaignManagementStore((state) => state.deleteCampaignContent);
  const removeAccount = useCampaignManagementStore((state) => state.removeAccount);
  const preparationSaveRef = useRef<TCampaignManagementDraft | null>(null);

  const {
    mutate: updateCampaign,
    mutateAsync: updateCampaignAsync,
    isPending: isSaving,
  } = useUpdateCampaignMutation({
    onSaved: (params, saved) => {
      const submitted = preparationSaveRef.current;
      
      applySavedCampaign(
        params,
        saved,
        submitted && isSameCampaignContext(submitted.params, params)
          ? submitted.campaign
          : undefined,
      );
    },
  });

  const canSave =
    isCurrentDraft &&
    (
      params?.status === "pending" ||
      params?.status === "distributing" ||
      params?.status === "proposal"
    );

  const isDirty = isCurrentDraft && isDraftDirty;

  const isReadOnly =
    !isCurrentDraft || params?.status === "completed";
  const isProposal = params?.status === "proposal";
  const reach = isCurrentDraft ? currentFollowers : 0;
  const canEditMetrics = isCurrentDraft && params?.status === "distributing";
  const canMarkAsPaid = isCurrentDraft && params?.status === "distributing";
  const canEditPostDetails = isCurrentDraft && params?.status === "distributing";
  const canReset = isCurrentDraft && hasBaseline && params?.status !== "completed";

  const resetEditors = useCallback(() => {
    setEditorRevision((revision) => revision + 1);
  }, []);

  const availableViews = useMemo(
    () =>
      isProposal
        ? CAMPAIGN_VIEWS.filter(
          (value) => value !== CAMPAIGN_VIEW.insights,
        )
        : CAMPAIGN_VIEWS,
    [isProposal],
  );

  const view = availableViews.includes(urlView)
    ? urlView
    : CAMPAIGN_VIEW.strategy;

  useEffect(() => {
    if (!params || urlView === view) return;

    void setView(view, { history: "replace" });
  }, [params, urlView, view, setView]);

  const handleSaveCampaign = () => {
    if (isCampaignActionBlocked()) return;

    if (menuActions.isMenuActionBlocked() || approveActions.isApproveFlowBlocked()) return;

    const state = useCampaignManagementStore.getState();
    const currentDraft = state.draft;

    if (
      !params ||
      !currentDraft ||
      !isSameCampaignContext(currentDraft.params, params) ||
      !selectCampaignIsDirty(state)
    ) {
      return;
    }

    const { status } = params;

    if (
      status !== "pending" &&
      status !== "distributing" &&
      status !== "proposal"
    ) {
      return;
    }

    updateCampaign({
      params: {
        ...params,
        status,
      },
      campaign: currentDraft.campaign,
    });
  };

  const handleResetDraft = () => {
    if (!canReset) return;

    restoreBaseline();
    resetEditors();
  };

  const synchronizeWhatsApp = useCallback(
    async (requestParams: ICampaignDetailsRequestParams) => {
      const campaign = await getCampaignById(
        requestParams,
        { silentError: true },
      );

      const updates: TCampaignWhatsAppAccountUpdate[] =
        campaign.addedAccounts.map((account) => ({
          addedAccountsId: account.addedAccountsId,
          whatsappStatus: account.whatsappStatus,
          whatsappLastAttemptAt: account.whatsappLastAttemptAt,
        }));

      queryClient.setQueriesData<ICampaignDetails>(
        {
          queryKey: [
            ...campaignsQueryKeys.details(),
            { campaignId: requestParams.campaignId },
          ],
        },
        (current) =>
          current
            ? applyWhatsAppUpdatesToCampaign(current, updates)
            : current,
      );

      applyWhatsAppUpdates(requestParams, updates);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            ...campaignsQueryKeys.details(),
            { campaignId: requestParams.campaignId },
          ],
          refetchType: "none",
        }),

        queryClient.invalidateQueries({
          queryKey: campaignsQueryKeys.lists(),
          refetchType: "none",
        }),
      ]);
    },
    [queryClient, applyWhatsAppUpdates],
  );

  const menuActions = useCampaignMenuActions({
    params,
    isSaving,
    canReset,
    resetDraft: handleResetDraft,
    saveCampaign: updateCampaignAsync,
    onStatusChanged: onCampaignStatusChanged,
    synchronizeWhatsApp,
    isActionUnavailable: () => isCampaignActionBlocked(),
  });

  const proposalActions = useProposalOptionActions({
    params,
    canReset,
    isSaving,
    resetDraft: handleResetDraft,
    saveCampaign: updateCampaignAsync,
    setOptionIndex,
  });

  const approveActions = useApproveProposalOptionActions({
    params,
    isSaving,
    canReset,
    resetDraft: handleResetDraft,
    saveCampaign: updateCampaignAsync,

    isUnavailable:
      proposalActions.isCreatingOption ||
      proposalActions.isCreateOptionModalOpen ||
      proposalActions.isUnsavedChangesModalOpen ||
      deleteActions.isDeleteFlowBusy,
  });

  const synchronizeCampaignAfterOperation = useCallback(
    async (requestParams: ICampaignDetailsRequestParams) => {
      const filters = {
        queryKey: campaignsQueryKeys.detail(requestParams),
        exact: true,
      };
      try {
        await queryClient.cancelQueries(filters);
        const refreshed = await getCampaignById(requestParams, { silentError: true });
        if (refreshed.campaignId !== requestParams.campaignId) {
          throw new Error("Cannot synchronize data from another campaign.");
        }
        // Also cancel GETs started by a remount while the scraper was running.
        await queryClient.cancelQueries(filters);
        queryClient.setQueryData(filters.queryKey, refreshed);
        const state = useCampaignManagementStore.getState();
        if (state.draft && isSameCampaignContext(state.draft.params, requestParams)) {
          state.applySavedCampaign(requestParams, refreshed);
          resetEditors();
        }
      } finally {
        await queryClient.invalidateQueries({
          queryKey: campaignsQueryKeys.lists(),
          refetchType: "none",
        });
      }
    },
    [queryClient, resetEditors],
  );

  const saveBeforeCampaignOperation = async (
    variables: Parameters<typeof updateCampaignAsync>[0],
  ) => {
    const submitted = {
      params: variables.params,
      campaign: variables.campaign,
    };

    preparationSaveRef.current = submitted;

    try {
      return await updateCampaignAsync(variables);
    } finally {
      if (preparationSaveRef.current === submitted) {
        preparationSaveRef.current = null;
      }
    }
  };

  const insightsActions = useUpdateCampaignInsightsActions({
    params,
    isUnavailable: () =>
      menuActions.isMenuActionBlocked() ||
      approveActions.isApproveFlowBlocked() ||
      deleteActions.isDeleteFlowBlocked(),
    saveCampaign: async (variables) => {
      const submitted = {
        params: variables.params,
        campaign: variables.campaign,
      };
      preparationSaveRef.current = submitted;
      try {
        return await updateCampaignAsync(variables);
      } finally {
        if (preparationSaveRef.current === submitted) preparationSaveRef.current = null;
      }
    },
    discardDraft: handleResetDraft,
    synchronize: synchronizeCampaignAfterOperation,
  });

  const xlsxActions = useAppendCampaignXlsxActions({
    params,

    isUnavailable: () =>
      menuActions.isMenuActionBlocked() ||
      approveActions.isApproveFlowBlocked() ||
      insightsActions.isInsightsActionBlocked() ||
      deleteActions.isDeleteFlowBlocked(),

    saveCampaign: saveBeforeCampaignOperation,
    discardDraft: handleResetDraft,
    synchronize: synchronizeCampaignAfterOperation,
  });

  const isXlsxFlowActive =
    xlsxActions.isImportXlsxModalOpen ||
    xlsxActions.isXlsxUnsavedChangesModalOpen ||
    xlsxActions.isXlsxLocked;

  const isCampaignEditingLocked =
    insightsActions.isInsightsLocked ||
    xlsxActions.isXlsxLocked ||
    deleteActions.isDeleteFlowBusy;

  const areCampaignActionsBusy =
    menuActions.isMenuBusy ||
    approveActions.isApproveFlowBusy ||
    insightsActions.isInsightsLocked ||
    insightsActions.isInsightsUnsavedChangesModalOpen ||
    isXlsxFlowActive ||
    deleteActions.isDeleteFlowBusy;

  const isCampaignActionBlocked = () =>
    insightsActions.isInsightsActionBlocked() ||
    xlsxActions.isXlsxActionBlocked() ||
    deleteActions.isDeleteFlowBlocked();

  // Check live operation state for callbacks held by open editors.
  const guardCampaignChange = <Args extends unknown[]>(
    action: (...args: Args) => void,
  ) => (...args: Args) => {
      const draft = useCampaignManagementStore.getState().draft;

      if (
        !params ||
        !draft ||
        !isSameCampaignContext(draft.params, params) ||
        isCampaignActionBlocked()
      ) {
        return;
      }

      action(...args);
    };

  const onPromoPaid = useCallback(
    async (result: IMarkPromoPaidResponse["data"]) => {
      const { campaignId } = result;

      const filters = {
        queryKey: [
          ...campaignsQueryKeys.details(),
          { campaignId },
        ] as const,
      };

      await queryClient.cancelQueries(filters);

      queryClient.setQueriesData<ICampaignDetails>(
        filters,
        (campaign) => campaign ? applyPromoPaidToCampaign(campaign, result) : campaign,
      );

      applyPromoPaid(result);
    },
    [queryClient, applyPromoPaid],
  );

  return {
    data: campaign,
    isInvalidParams,
    isPending,
    isError,
    error,
    isDirty,

    canSave:
      canSave &&
      isDirty &&
      !areCampaignActionsBusy,

    canReset:
      canReset &&
      !areCampaignActionsBusy,

    isReadOnly,

    canEditMetrics:
      canEditMetrics &&
      !isCampaignEditingLocked,

    canMarkAsPaid:
      canMarkAsPaid &&
      !insightsActions.isInsightsLocked &&
      !insightsActions.isInsightsUnsavedChangesModalOpen &&
      !isXlsxFlowActive &&
      !deleteActions.isDeleteFlowBusy,

    canEditPostDetails:
      canEditPostDetails &&
      !isCampaignEditingLocked,

    isProposal,
    optionIndex,
    view,
    reach,
    availableViews,
    editorRevision,
    isSaving,

    ...menuActions,
    ...proposalActions,
    ...approveActions,
    ...insightsActions,
    ...xlsxActions,
    ...deleteActions,

    isCampaignEditingLocked,
    isCampaignActionBlocked,

    isMenuBusy:
      menuActions.isMenuBusy ||
      insightsActions.isInsightsLocked ||
      insightsActions.isInsightsUnsavedChangesModalOpen ||
      isXlsxFlowActive ||
      deleteActions.isDeleteFlowBusy,

    isUpdateInsightsDisabled:
      insightsActions.isUpdateInsightsDisabled ||
      isXlsxFlowActive ||
      deleteActions.isDeleteFlowBusy,

    requestUpdateInsights: () => {
      if (xlsxActions.isXlsxActionBlocked() || deleteActions.isDeleteFlowBlocked()) return;

      insightsActions.requestUpdateInsights();
    },

    retryInsightsRefresh: () => {
      if (xlsxActions.isXlsxActionBlocked() || deleteActions.isDeleteFlowBlocked()) return;

      insightsActions.retryInsightsRefresh();
    },

    openCreateOptionModal: () => {
      if (approveActions.isApproveFlowBlocked() || deleteActions.isDeleteFlowBlocked()) return;

      proposalActions.openCreateOptionModal();
    },

    changeProposalOption: (nextOptionIndex: number) => {
      if (approveActions.isApproveFlowBlocked() || deleteActions.isDeleteFlowBlocked()) return;

      proposalActions.changeProposalOption(nextOptionIndex);
    },

    saveCampaign: handleSaveCampaign,
    setView,

    resetDraft: () => {
      if (
        isCampaignActionBlocked() ||
        approveActions.isApproveFlowBlocked()
      ) {
        return;
      }

      handleResetDraft();
    },

    updateCampaignName:
      guardCampaignChange(updateCampaignName),
    setPriceHidden:
      guardCampaignChange(setPriceHidden),
    setCpmAndResultHidden:
      guardCampaignChange(setCpmAndResultHidden),
    setDisplayCurrency:
      guardCampaignChange(setDisplayCurrency),
    setPrice:
      guardCampaignChange(setPrice),

    setAccountSelectedContent:
      guardCampaignChange(setAccountSelectedContent),
    setAccountSelectedDescription:
      guardCampaignChange(setAccountSelectedDescription),
    setAccountSelectedBrief:
      guardCampaignChange(setAccountSelectedBrief),
    setAccountDateRequest:
      guardCampaignChange(setAccountDateRequest),
    setAccountPostLink:
      guardCampaignChange(setAccountPostLink),
    setAccountScreenshot:
      guardCampaignChange(setAccountScreenshot),

    onCreateContentForAccount:
      guardCampaignChange(onCreateContentForAccount),
    onCreateBriefForAccount:
      guardCampaignChange(onCreateBriefForAccount),
    onCreateDescriptionForAccount:
      guardCampaignChange(onCreateDescriptionForAccount),
    onUpdateDescriptionForAccount:
      guardCampaignChange(onUpdateDescriptionForAccount),
    onUpdateBriefForAccount:
      guardCampaignChange(onUpdateBriefForAccount),
    onUpdateContentTaggedUser:
      guardCampaignChange(onUpdateContentTaggedUser),
    onUpdateContentTaggedLink:
      guardCampaignChange(onUpdateContentTaggedLink),
    onUpdateAccountMetricField:
      guardCampaignChange(onUpdateAccountMetricField),

    onPromoPaid,

    deleteContentDescription:
      guardCampaignChange(deleteContentDescription),
    deleteContentBrief:
      guardCampaignChange(deleteContentBrief),
    deleteCampaignContent:
      guardCampaignChange(deleteCampaignContent),
    removeAccount:
      guardCampaignChange(removeAccount),
  };
}
