import { useRef, useState } from "react";
import { useCampaignManagementState } from "@/pages/campaign-management-v2/model/use-campaign-management-state.ts";
import { CampaignNavigation } from "@/widgets/campaign-management-v2/campaign-navigation";
import { CampaignHeader } from "@/widgets/campaign-management-v2/campaign-header";
import { CampaignMetrics } from "@/widgets/campaign-management-v2/campaign-metrics";
import { CampaignToolbar } from "@/widgets/campaign-management-v2/campaign-toolbar";
import { CampaignWorkspace } from "@/widgets/campaign-management-v2/campaign-workspace";
import { CampaignInfo } from "@/widgets/campaign-management-v2/campaign-info/campaign-info.tsx";
import { ProposalOptionToolbar } from "@/widgets/campaign-management-v2/proposal-option-toolbar";
import { UnsavedChangesModal } from "@/widgets/campaign-management-v2/ui/unsaved-changes-modal";
import { CreateProposalOptionModal } from "@/features/campaign-management/create-proposal-option";
import { CampaignMenu } from "@/widgets/campaign-management-v2/ui/campaign-menu";
import { CampaignMessagePreviewModal } from "@/features/campaign-management/send-campaign-whatsapp";

import s from './campaign-management.module.scss';

export const CampaignManagementPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const messageButtonRef = useRef<HTMLButtonElement | null>(null);
  
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
    canSave,
    isSaving,
    isCreatingOption,
    isCreateOptionModalOpen,
    isUnsavedChangesModalOpen,
    isDownloadingPdf,
    isMenuBusy,
    isChangingCampaignStatus,
    isMenuConfirmationOpen,
    statusTransitionHref,
    canCloseCampaign,
    canReopenCampaign,
    canSendWhatsApp,
    isSendingWhatsApp,
    whatsAppAttempts,
    messagePreview,
    isMessageConfirmationOpen,
    isSendingEmail,
    sendEmailPreview,
    requestMessagePreview,
    closeMessagePreview,
    sendMessagePreview,
    requestWhatsAppSend,
    requestCloseCampaign,
    requestReopenCampaign,
    cancelMenuAction,
    saveAndContinueMenuAction,
    discardAndContinueMenuAction,
    requestPdfDownload,
    openCreateOptionModal,
    closeCreateOptionModal,
    cancelProposalAction,
    saveAndContinueProposalAction,
    discardAndContinueProposalAction,
    createProposalCopy,
    changeProposalOption,
    saveCampaign,
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
  } = useCampaignManagementState({
    onCampaignStatusChanged: () => setIsMenuOpen(false),
  });

  const handleOpenMessagePreview = (
    influencerId: string,
    trigger: HTMLButtonElement,
  ) => {
    if (isMenuBusy) return;

    messageButtonRef.current = trigger;
    requestMessagePreview(influencerId);
  };

  const restoreMessageButtonFocus = () => {
    const button = messageButtonRef.current;

    if (button?.isConnected && !button.disabled) {
      button.focus();
    } else {
      menuButtonRef.current?.focus();
    }
  };
  
  const areCampaignActionsDisabled =
    isInvalidParams || isPending || isError || !data;

  const pageMessage = isInvalidParams
    ? "Campaign parameters are invalid."
    : isPending
      ? "Campaign loading..."
      : isError
        ? `Loading error: ${error?.message ?? "Unknown error"}`
        : !data
          ? "Campaign not found!"
          : null;

  return (
    <div className={s.page}>
      <CampaignNavigation
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Campaigns", to: "/dashboard/campaigns" },
          { label: "Campaign Management" },
        ]}
        onMenuClick={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        menuButtonRef={menuButtonRef}
        disabled={areCampaignActionsDisabled}
        showActions={!isProposal}
      />

      {statusTransitionHref && (
        <p role="status">
          Campaign status has been changed.{" "}
          <a href={statusTransitionHref}>
            Open updated campaign
          </a>
        </p>
      )}

      {pageMessage !== null ? (
        <div
          className={s.pageState}
          role={isError || isInvalidParams ? "alert" : "status"}
        >
          {pageMessage}
        </div>
      ) : data ? (
        <>
          {!isProposal && (
            <CampaignMenu
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
              campaignName={data.campaignName}
              accounts={data.addedAccounts}
              onDownloadPdf={requestPdfDownload}
              canSendWhatsApp={canSendWhatsApp}
              onSendWhatsApp={requestWhatsAppSend}
              isSendingWhatsApp={isSendingWhatsApp}
              whatsAppAttempts={whatsAppAttempts}
              isDownloadingPdf={isDownloadingPdf}
              isSaving={isSaving}
              isMenuBusy={isMenuBusy}
              isChangingCampaignStatus={isChangingCampaignStatus}
              isMenuConfirmationOpen={isMenuConfirmationOpen}
              canCloseCampaign={canCloseCampaign}
              canReopenCampaign={canReopenCampaign}
              onCloseCampaign={requestCloseCampaign}
              onReopenCampaign={requestReopenCampaign}
              onCancelMenuAction={cancelMenuAction}
              onSaveAndContinueMenuAction={saveAndContinueMenuAction}
              onDiscardAndContinueMenuAction={discardAndContinueMenuAction}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                menuButtonRef.current?.focus();
              }}
            />
          )}
          
          <CampaignHeader
            onSave={saveCampaign}
            isSaving={isSaving}
            isSaveDisabled={!canSave}
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
                onOptionChange={changeProposalOption}
                onCreateOption={openCreateOptionModal}
                disabled={isSaving || isCreatingOption}
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
              canSendMessage={canSendWhatsApp}
              isMessageActionDisabled={isMenuBusy}
              onOpenMessagePreview={handleOpenMessagePreview}
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

          {isProposal  && (
            <>
              <CreateProposalOptionModal
                open={isCreateOptionModalOpen}
                onOpenChange={(open) => {
                  if (!open) closeCreateOptionModal();
                }}
                selectedOptionIndex={optionIndex}
                onCreateCopy={createProposalCopy}
                isPending={isCreatingOption}
              />

              <UnsavedChangesModal
                open={isUnsavedChangesModalOpen}
                onOpenChange={(open) => {
                  if (!open) cancelProposalAction();
                }}
                onSave={() => {
                  void saveAndContinueProposalAction();
                }}
                onDiscard={discardAndContinueProposalAction}
                isSaving={isSaving}
              />
            </>
          )}

          {!isProposal && (
            <UnsavedChangesModal
              open={isMessageConfirmationOpen}
              description={
                "This campaign has unsaved changes. Save or discard them " +
                "before previewing the message. This applies to all campaign changes."
              }
              onOpenChange={(open) => {
                if (!open) cancelMenuAction();
              }}
              onSave={saveAndContinueMenuAction}
              onDiscard={discardAndContinueMenuAction}
              isSaving={isSaving}
              onCloseAutoFocus={(event) => {
                event.preventDefault();

                if (!messagePreview) {
                  restoreMessageButtonFocus();
                }
              }}
            />
          )}

          {!isProposal && messagePreview && (
            <CampaignMessagePreviewModal
              preview={messagePreview}
              isSending={isSendingWhatsApp}
              isSendingEmail={isSendingEmail}
              onClose={closeMessagePreview}
              onSendWhatsApp={sendMessagePreview}
              onSendEmail={sendEmailPreview}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                restoreMessageButtonFocus();
              }}
            />
          )}
        </>
      ) : null}
    </div>
  );
};
