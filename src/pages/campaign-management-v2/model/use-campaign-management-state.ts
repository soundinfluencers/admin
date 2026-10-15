import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useCampaignMenuActions } from "./use-campaign-menu-actions";
import { applyPromoPaidToCampaign } from "@/entities/campaign/model/apply-promo-paid-to-campaign.ts";
import { applyWhatsAppUpdatesToCampaign, } from "@/entities/campaign/model/apply-whatsapp-updates-to-campaign";
import { getCampaignById } from "@/entities/campaign";

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

  const {
    campaign,
    isCurrentDraft,
    isInvalidParams,
    isPending,
    isError,
    error,
  } = useCampaignDraft(params);

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

  const {
    mutate: updateCampaign,
    mutateAsync: updateCampaignAsync,
    isPending: isSaving,
  } = useUpdateCampaignMutation({
    onSaved: applySavedCampaign,
  });

  const canSave =
    isCurrentDraft &&
    (
      params?.status === "pending" ||
      params?.status === "distributing" ||
      params?.status === "proposal"
    );

  const isDirty = isCurrentDraft && isDraftDirty;

  const isReadOnly = !isCurrentDraft || params?.status === "completed";
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
    if (menuActions.isMenuActionBlocked()) return;
    
    const currentDraft = useCampaignManagementStore.getState().draft;

    if (
      !params ||
      !currentDraft ||
      !isSameCampaignContext(currentDraft.params, params)
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
  });

  const proposalActions = useProposalOptionActions({
    params,
    canReset,
    isSaving,
    resetDraft: handleResetDraft,
    saveCampaign: updateCampaignAsync,
    setOptionIndex,
  });

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
    canSave: canSave && !menuActions.isMenuBusy,
    canReset: canReset && !menuActions.isMenuBusy,
    isReadOnly,
    canEditMetrics,
    canMarkAsPaid,
    canEditPostDetails,
    isProposal,
    optionIndex,
    view,
    reach,
    availableViews,
    editorRevision,
    isSaving,
    ...menuActions,
    ...proposalActions,

    saveCampaign: handleSaveCampaign,
    setView,
    resetDraft: handleResetDraft,
    updateCampaignName,
    setPriceHidden,
    setCpmAndResultHidden,
    setDisplayCurrency,
    setPrice,
    setAccountSelectedContent,
    setAccountSelectedDescription,
    setAccountSelectedBrief,
    setAccountDateRequest,
    setAccountPostLink,
    setAccountScreenshot,
    onCreateContentForAccount,
    onCreateBriefForAccount,
    onCreateDescriptionForAccount,
    onUpdateDescriptionForAccount,
    onUpdateBriefForAccount,
    onUpdateContentTaggedUser,
    onUpdateContentTaggedLink,
    onUpdateAccountMetricField,
    onPromoPaid,
    deleteContentDescription,
    deleteContentBrief,
    deleteCampaignContent,
    removeAccount,
  }
}
