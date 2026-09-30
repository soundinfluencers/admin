import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCampaignDetailsQuery } from "@/entities/campaign/api/use-campaigns-query.ts";
import { useCampaignManagementStore } from "../store/campaign-management.store.ts";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { isCampaignStatus } from "./url-path-helpers.ts";
import { CAMPAIGN_VIEWS } from "@/shared/constants/campaign-view.ts";
import type { ICampaignDetailsRequestParams } from "@/entities/campaign/model/campaign-details.types.ts";

export const useCampaignManagementState = () => {
  const { campaignId, status } = useParams<"campaignId" | "status">();
  
  const [optionIndex, setOptionIndex] = useQueryState(
    "proposal-option",
    parseAsInteger.withDefault(0),
  );

  const [view, setView] = useQueryState(
    "tab",
    parseAsStringLiteral(CAMPAIGN_VIEWS).withDefault("strategy"),
  );
  
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
  const initializeDraft = useCampaignManagementStore((state) => state.initializeDraft);
  const resetDraft = useCampaignManagementStore((state) => state.resetDraft);
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
  const deleteCampaignContent = useCampaignManagementStore((state) => state.deleteCampaignContent);
  const removeAccount = useCampaignManagementStore((state) => state.removeAccount);

  const isCurrentDraft = 
    params !== null &&
    draft !== null &&
    draft.params.campaignId === params.campaignId &&
    draft.params.status === params.status &&
    draft.params.optionIndex === params.optionIndex;
  
  const canReset = isCurrentDraft && Boolean(serverCampaign);
  
  const handleResetDraft = () => {
    if (!canReset) return;
    
    resetDraft();
  };
  
  useEffect(() => {
    if (!params || !serverCampaign || isCurrentDraft) return;
    
    initializeDraft({
      params,
      campaign: serverCampaign,
    });
  }, [params, serverCampaign, isCurrentDraft, initializeDraft]);
  
  const campaign = isCurrentDraft ? draft.campaign : null;
  
  const isPending = 
    params !== null &&
    campaign === null &&
    !isQueryError;
  
  const isInvalidParams = params === null;
  const isError = campaign === null && isQueryError;
  const error = campaign === null ? queryError : null;
  
  return {
    data: campaign,
    isInvalidParams,
    isPending,
    isError,
    error,
    canReset,
    optionIndex,
    view,
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
    onCreateContentForAccount,
    onCreateBriefForAccount,
    onCreateDescriptionForAccount,
    onUpdateDescriptionForAccount,
    onUpdateBriefForAccount,
    onUpdateContentTaggedUser,
    onUpdateContentTaggedLink,
    deleteContentDescription,
    deleteContentBrief,
    deleteCampaignContent,
    removeAccount,
  }
}
