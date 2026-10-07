import { useState } from "react";
import { useCampaignManagementState } from "@/pages/campaign-management-v2/model/use-campaign-management-state.ts";
import { CampaignNavigation } from "@/widgets/campaign-management-v2/campaign-navigation";
import { CampaignHeader } from "@/widgets/campaign-management-v2/campaign-header";
import { CampaignMetrics } from "@/widgets/campaign-management-v2/campaign-metrics";
import { CampaignToolbar } from "@/widgets/campaign-management-v2/campaign-toolbar";
import { CampaignWorkspace } from "@/widgets/campaign-management-v2/campaign-workspace";
import { CampaignInfo } from "@/widgets/campaign-management-v2/campaign-info/campaign-info.tsx";
import { ProposalOptionToolbar } from "@/widgets/campaign-management-v2/proposal-option-toolbar";
import { CreateProposalOptionModal } from "@/features/campaign-management/create-proposal-option";

import s from './campaign-management.module.scss';

export const CampaignManagementPage = () => {
  const {
    data,
    isInvalidParams,
    isPending,
    isError,
    error,
    view,
    reach,
    canReset,
    canEditMetrics,
    canMarkAsPaid,
    canEditPostDetails,
    isReadOnly,
    isProposal,
    availableViews,
    optionIndex,
    editorRevision,
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
    onUpdateContentTaggedLink,
    onUpdateContentTaggedUser,
    onUpdateBriefForAccount,
    onUpdateAccountMetricField,
    onPromoPaid,
    deleteContentDescription,
    deleteContentBrief,
    deleteCampaignContent,
    removeAccount,
    setView,
    resetDraft,
  } = useCampaignManagementState();

  const [isCreateOptionModalOpen, setCreateOptionModalOpen] = useState(false);

  if (isInvalidParams) {
    return <div>Campaign parameters is invalid.</div>;
  }

  if (isPending) {
    return <div>Campaign loading...</div>;
  }

  if (isError) {
    return <div>Loading error: {error?.message}</div>;
  }

  if (!data) {
    return <div>Campaign not found!</div>;
  }

  console.log("CAMPAIGN: ", data);

  return (
    <div className={s.page}>
      <CampaignNavigation
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Campaigns", to: "/dashboard/campaigns" },
          { label: "Campaign Management" },
        ]}
      />

      <CampaignHeader
        // isSaving={isSaving}
        campaignName={data.campaignName}
        onCampaignNameChange={updateCampaignName}
        campaignStatus={data.status}
        internalCost={data.internalCost}
        currency={data.displayCurrency}
        onReset={resetDraft}
        isResetDisabled={!canReset}
        readOnly={isReadOnly}
      />

      <div className={s.content}>
        {isProposal ? (
          <CampaignInfo
            campaign={data}
            readOnly={isReadOnly}
            reach={reach}
            onPriceChange={setPrice}
            onCurrencyChange={setDisplayCurrency}
          />
        ) : (
          <CampaignMetrics
            campaign={data}
            reach={reach}
            onPriceHiddenChange={setPriceHidden}
            onCpmAndResultHiddenChange={setCpmAndResultHidden}
            onPriceChange={setPrice}
            onCurrencyChange={setDisplayCurrency}
            readOnly={isReadOnly}
          />
        )}

        {isProposal && (
          <ProposalOptionToolbar
            options={data.existingOptions}
            selectedOptionIndex={optionIndex}
            onOptionChange={() => {}}
            onCreateOption={() => setCreateOptionModalOpen(true)}
          />
        )}

        <CampaignToolbar
          value={view}
          availableViews={availableViews}
          onValueChange={setView}
        />

        <CampaignWorkspace
          campaign={data}
          view={view}
          editorRevision={editorRevision}
          canEditMetrics={canEditMetrics}
          canMarkAsPaid={canMarkAsPaid}
          canEditPostDetails={canEditPostDetails}
          readOnly={isReadOnly}
          onAccountContentChange={setAccountSelectedContent}
          onCreateContentForAccount={onCreateContentForAccount}
          onAccountDescriptionChange={setAccountSelectedDescription}
          onAccountBriefChange={setAccountSelectedBrief}
          onCreateBriefForAccount={onCreateBriefForAccount}
          onCreateDescriptionForAccount={onCreateDescriptionForAccount}
          onUpdateDescriptionForAccount={onUpdateDescriptionForAccount}
          onUpdateBriefForAccount={onUpdateBriefForAccount}
          onUpdateContentTaggedLink={onUpdateContentTaggedLink}
          onUpdateContentTaggedUser={onUpdateContentTaggedUser}
          onUpdatePostLink={setAccountPostLink}
          onUpdateScreenshot={setAccountScreenshot}
          onUpdateAccountMetricField={onUpdateAccountMetricField}
          onPromoPaid={onPromoPaid}
          onAccountDateRequestChange={setAccountDateRequest}
          onDeleteContentDescription={deleteContentDescription}
          onDeleteContentBrief={deleteContentBrief}
          onDeleteCampaignContent={deleteCampaignContent}
          onAccountRemove={removeAccount}
        />
      </div>

      {isProposal && (
        <CreateProposalOptionModal
          open={isCreateOptionModalOpen}
          onOpenChange={setCreateOptionModalOpen}
          selectedOptionIndex={optionIndex}
        />
      )}
    </div>
  );
};
