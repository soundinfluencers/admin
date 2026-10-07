import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { useCampaignDetailsQuery } from "@/entities/campaign/api/use-campaigns-query.ts";
import { campaignsQueryKeys } from "@/entities/campaign/api/campaign.query-keys.ts";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";
import { selectCurrentFollowers } from "../store/campaign-management.selectors.ts";
import { isCampaignStatus } from "./url-path-helpers.ts";
import {
  selectCampaignHasBaseline,
  selectCampaignIsDirty,
} from "../store/campaign-management.comparison";
import { CAMPAIGN_VIEW, CAMPAIGN_VIEWS } from "@/shared/constants/campaign-view.ts";

import type {
  ICampaignDetails,
  ICampaignDetailsRequestParams,
  IMarkPromoPaidResponse,
} from "@/entities/campaign/model/campaign-details.types.ts";

export const useCampaignManagementState = () => {
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
    data: serverCampaign,
    isError: isQueryError,
    error: queryError,
  } = useCampaignDetailsQuery(params);
  
  const draft = useCampaignManagementStore((state) => state.draft);
  const hasBaseline = useCampaignManagementStore(selectCampaignHasBaseline);
  const isDraftDirty = useCampaignManagementStore(selectCampaignIsDirty);
  const currentFollowers = useCampaignManagementStore(selectCurrentFollowers);
  const initializeDraft = useCampaignManagementStore((state) => state.initializeDraft);
  // const resetDraft = useCampaignManagementStore((state) => state.resetDraft);
  const restoreBaseline = useCampaignManagementStore((state) => state.restoreBaseline);
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
  const deleteCampaignContent = useCampaignManagementStore((state) => state.deleteCampaignContent);
  const removeAccount = useCampaignManagementStore((state) => state.removeAccount);

  const isCurrentDraft =
    params !== null &&
    draft !== null &&
    draft.params.campaignId === params.campaignId &&
    draft.params.status === params.status &&
    draft.params.optionIndex === params.optionIndex;

  const isDirty = isCurrentDraft && isDraftDirty;

  useEffect(() => {
    if (!params || !serverCampaign || isCurrentDraft) return;

    initializeDraft({
      params,
      campaign: serverCampaign,
    });
  }, [params, serverCampaign, isCurrentDraft, initializeDraft]);
  
  const isReadOnly = !isCurrentDraft || draft?.params.status === "completed";
  const isProposal = params?.status === "proposal";
  const campaign = isCurrentDraft ? draft.campaign : null;
  const reach = isCurrentDraft ? currentFollowers : 0;
  const isPending = params !== null && campaign === null && !isQueryError;
  const isInvalidParams = params === null;
  const isError = campaign === null && isQueryError;
  const error = campaign === null ? queryError : null;
  const canEditMetrics = isCurrentDraft && draft?.params.status === "distributing";
  const canMarkAsPaid = isCurrentDraft && draft?.params.status === "distributing";
  const canEditPostDetails = isCurrentDraft && draft?.params.status === "distributing";
  const canReset = isCurrentDraft && hasBaseline && draft?.params.status !== "completed";

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
  
  const handleResetDraft = () => {
    if (!canReset) return;

    restoreBaseline();
    resetEditors();
  };
  
  const onPromoPaid = useCallback(
    async (result: IMarkPromoPaidResponse["data"]) => {
      const {
        campaignId,
        promoId,
        closePromo,
        statusLabel,
      } = result;

      const filters = {
        queryKey: [
          ...campaignsQueryKeys.details(),
          { campaignId },
        ] as const,
      };

      await queryClient.cancelQueries(filters);

      queryClient.setQueriesData<ICampaignDetails>(
        filters,
        (campaign) => {
          if (!campaign) return campaign;

          const account = campaign.addedAccounts.find(
            (item) => item.addedAccountsId === promoId,
          );

          if (!account) return campaign;

          if (
            account.closePromo === closePromo &&
            account.statusLabel === statusLabel
          ) {
            return campaign;
          }

          return {
            ...campaign,
            addedAccounts: campaign.addedAccounts.map((item) =>
              item.addedAccountsId === promoId
                ? {
                  ...item,
                  closePromo,
                  statusLabel,
                }
                : item,
            ),
          };
        },
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
    canReset,
    canEditMetrics,
    canMarkAsPaid,
    canEditPostDetails,
    isProposal,
    isReadOnly,
    optionIndex,
    view,
    reach,
    availableViews,
    editorRevision,
    setView,
    setOptionIndex,
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
