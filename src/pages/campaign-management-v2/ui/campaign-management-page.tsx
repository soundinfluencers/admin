import clsx from 'clsx';
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
import { ApproveProposalOptionModal } from "@/features/campaign-management/approve-proposal-option";
import { DeleteProposalOptionModal } from "@/features/campaign-management/delete-proposal-option";
import { CampaignMenu } from "@/widgets/campaign-management-v2/ui/campaign-menu";
import { CampaignMessagePreviewModal } from "@/features/campaign-management/send-campaign-whatsapp";
import { AppendCampaignXlsxModal } from "@/features/campaign-management/append-campaign-xlsx";
import { Button } from "@/shared/ui/v2/button-v2";
import { ButtonLink } from "@/shared/ui/v2/button-link";
import { Loader } from "@/shared/ui/v2/loader";
import { CampaignRecoveryNotice } from "./campaign-recovery-notice/campaign-recovery-notice.tsx";

import s from './campaign-management.module.scss';

export const CampaignManagementPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const messageButtonRef = useRef<HTMLButtonElement | null>(null);
  const approveButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const xlsxRetryButtonRef = useRef<HTMLButtonElement>(null);

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
    canUpdateInsights,
    isUpdateInsightsDisabled,
    isUpdatingInsights,
    isPreparingInsights,
    isCampaignEditingLocked,
    needsInsightsRefresh,
    isInsightsUnsavedChangesModalOpen,
    isCampaignActionBlocked,
    requestUpdateInsights,
    retryInsightsRefresh,
    saveAndContinueInsights,
    discardAndContinueInsights,
    cancelInsightsPreparation,
    canImportXlsx,
    isImportXlsxDisabled,
    isImportXlsxModalOpen,
    isXlsxUnsavedChangesModalOpen,
    isPreparingXlsx,
    isImportingXlsx,
    needsXlsxRefresh,
    isXlsxDialogActive,
    requestXlsxImport,
    closeXlsxImport,
    cancelXlsxPreparation,
    saveBeforeXlsxImport,
    discardBeforeXlsxImport,
    confirmXlsxImport,
    retryXlsxRefresh,
    isReadOnly,
    isProposal,
    availableViews,
    optionIndex,
    editorRevision,
    canSave,
    isDirty,
    isSaving,
    isDeleteOptionModalOpen,
    isDeletingOption,
    isDeleteFlowBusy,
    isDeleteRecoveryActive,
    needsDeletedOptionRefresh,
    deletedOptionNavigationHref,
    willDeleteCampaign,
    openDeleteOptionModal,
    closeDeleteOptionModal,
    confirmDeleteOption,
    retryDeletedOptionRefresh,
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
    isApproveOptionModalOpen,
    isApproveUnsavedChangesModalOpen,
    isApproveFlowBusy,
    isPreparingApproval,
    isApprovingOption,
    approveTransitionHref,
    proposalUnsavedChangesDescription,
    proposalApproveUnsavedChangesDescription,
    isApproveDialogActive,
    openApproveOptionModal,
    closeApproveOptionModal,
    cancelApprovePreparation,
    saveBeforeApprove,
    discardBeforeApprove,
    confirmApproveOption,
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

  const handleOpenDeleteOption = (trigger: HTMLButtonElement) => {
    deleteButtonRef.current = trigger;
    openDeleteOptionModal();
  };

  const handleOpenApproveOption = (trigger: HTMLButtonElement) => {
    approveButtonRef.current = trigger;
    openApproveOptionModal();
  };

  const restoreApproveButtonFocus = () => {
    // Switching between dialogs must not move focus to the toolbar.
    if (isApproveDialogActive()) return;

    const button = approveButtonRef.current;

    if (button?.isConnected && !button.disabled) {
      button.focus();
    }
  };

  const restoreXlsxButtonFocus = () => {
    if (isXlsxDialogActive()) return;

    const button = importButtonRef.current;

    if (button?.isConnected && !button.disabled) {
      button.focus();
    } else {
      xlsxRetryButtonRef.current?.focus();
    }
  };

  const campaignTransitionHref = approveTransitionHref ?? statusTransitionHref;

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
    isInvalidParams || isPending || isError || !data || isDeleteFlowBusy;

  const isPageLoading =
    !isInvalidParams &&
    !needsDeletedOptionRefresh &&
    !deletedOptionNavigationHref &&
    (isPending || isDeleteRecoveryActive);

  const pageMessage = isInvalidParams
    ? "Campaign parameters are invalid."
    : isPending
      ? null
      : isError
        ? `Loading error: ${error?.message ?? "Unknown error"}`
        : !data
          ? "Campaign not found!"
          : null;

  return (
    <div className={clsx(s.page, isPageLoading && s.pageLoading)}>
      <CampaignNavigation
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Campaigns", to: "/dashboard/campaigns" },
          { label: "Campaign Management" },
        ]}
        shareLink={data?.shareLink ?? ""}
        onMenuClick={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        menuButtonRef={menuButtonRef}
        disabled={areCampaignActionsDisabled}
        showManagementActions={!isProposal}
        hasData={Boolean(data)}
        canUpdateInsights={canUpdateInsights}
        isUpdateInsightsDisabled={isUpdateInsightsDisabled}
        isUpdatingInsights={isUpdatingInsights}
        isPreparingInsights={isPreparingInsights}
        onUpdateInsights={requestUpdateInsights}
        canImportXlsx={canImportXlsx}
        isImportXlsxDisabled={isImportXlsxDisabled}
        onImportXlsx={requestXlsxImport}
        importButtonRef={importButtonRef}
      />

      {campaignTransitionHref && (
        <CampaignRecoveryNotice
          role="status"
          title="Campaign status has changed"
          description="Open the updated campaign to continue."
          action={
            <ButtonLink
              label="Open updated campaign"
              href={campaignTransitionHref}
            />
          }
        />
      )}

      {isPageLoading ? (
        <div className={s.loadingState}>
          <Loader />
        </div>
      ) : needsDeletedOptionRefresh ? (
        <CampaignRecoveryNotice
          role="alert"
          title="Option deleted. Could not load the remaining option."
          description="Retry to load the latest campaign data. The deletion will not be repeated."
          action={
            <Button
              type="button"
              label="Retry data refresh"
              onClick={() => { void retryDeletedOptionRefresh(); }}
            />
          }
        />
      ) : deletedOptionNavigationHref ? (
        <CampaignRecoveryNotice
          role="alert"
          title="Deletion completed. Could not open the next page."
          description="Use the link to continue."
          action={
            <ButtonLink
              label={willDeleteCampaign ? "Open campaigns" : "Open remaining option"}
              href={deletedOptionNavigationHref}
            />
          }
        />
      ) : pageMessage !== null ? (
        <div
          className={s.pageState}
          role={isError || isInvalidParams ? "alert" : "status"}
        >
          {pageMessage}
        </div>
      ) : data ? (
        <>
          {needsInsightsRefresh && (
            <CampaignRecoveryNotice
              role="alert"
              title="Could not refresh campaign data"
              description={
                <>
                  Processing has finished, but the latest campaign data could not be loaded. Editing is temporarily
                  disabled. Retry to load the latest data.
                </>
              }
              action={
                <>
                  <Button
                    type="button"
                    label="Retry data refresh"
                    loadingLabel="Refreshing…"
                    isLoading={isUpdatingInsights}
                    disabled={isUpdatingInsights}
                    aria-busy={isUpdatingInsights}
                    onClick={retryInsightsRefresh}
                  />
                  {isUpdatingInsights && (
                    <span className="visually-hidden" role="status" aria-label="Refreshing campaign data" />
                  )}
                </>
              }
            />
          )}

          {needsXlsxRefresh && (
            <CampaignRecoveryNotice
              role="alert"
              title="Could not refresh campaign data"
              description={
                <>
                  Import completed, but the latest campaign data could
                  not be loaded. Editing is temporarily disabled.
                  Retry to load the latest data.
                </>
              }
              action={
                <Button
                  ref={xlsxRetryButtonRef}
                  type="button"
                  label="Retry data refresh"
                  loadingLabel="Refreshing…"
                  isLoading={isImportingXlsx}
                  disabled={isImportingXlsx}
                  aria-busy={isImportingXlsx}
                  onClick={() => {
                    void retryXlsxRefresh();
                  }}
                />
              }
            />
          )}

          <UnsavedChangesModal
            open={isInsightsUnsavedChangesModalOpen}
            description="Save or discard your changes before updating insights. Processing will start after continuing."
            onOpenChange={(open) => {
              if (!open) cancelInsightsPreparation();
            }}
            onSave={saveAndContinueInsights}
            onDiscard={discardAndContinueInsights}
            isSaving={isPreparingInsights}
          />

          <AppendCampaignXlsxModal
            key={data.campaignId}
            open={isImportXlsxModalOpen}
            campaignName={data.campaignName}
            isImporting={isImportingXlsx}
            onImport={confirmXlsxImport}
            onClose={closeXlsxImport}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              restoreXlsxButtonFocus();
            }}
          />

          <UnsavedChangesModal
            open={isXlsxUnsavedChangesModalOpen}
            description={
              "Save or discard your changes before importing placements. " +
              "You will continue to the file selection dialog. " +
              "The import will not start automatically."
            }
            onOpenChange={(open) => {
              if (!open) cancelXlsxPreparation();
            }}
            onSave={saveBeforeXlsxImport}
            onDiscard={discardBeforeXlsxImport}
            isSaving={isPreparingXlsx}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              restoreXlsxButtonFocus();
            }}
          />

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
            isEditingDisabled={isCampaignEditingLocked}
            onSave={saveCampaign}
            isSaving={isSaving}
            isSaveDisabled={!canSave}
            isDirty={isDirty}
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
                isBudgetDisabled={isCampaignEditingLocked}
                reach={reach}
                onPriceChange={setPrice}
                onCurrencyChange={setDisplayCurrency}
              />
            ) : (
              <CampaignMetrics
                isBudgetDisabled={isCampaignEditingLocked}
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
                onApproveOption={handleOpenApproveOption}
                onDeleteOption={handleOpenDeleteOption}
                disabled={isSaving || isCreatingOption || isApproveFlowBusy || isDeleteFlowBusy}
              />
            )}

            <CampaignToolbar
              value={view}
              availableViews={availableViews}
              onValueChange={setView}
            />

            <CampaignWorkspace
              isInsightsLocked={isCampaignEditingLocked}
              isInsightsActionBlocked={isCampaignActionBlocked}
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

          {isProposal && (
            <>
              <DeleteProposalOptionModal
                open={isDeleteOptionModalOpen}
                selectedOptionIndex={optionIndex}
                willDeleteCampaign={willDeleteCampaign}
                isPending={isDeletingOption}
                onOpenChange={(open) => { if (!open) closeDeleteOptionModal(); }}
                onDelete={() => { void confirmDeleteOption(); }}
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  const button = deleteButtonRef.current;
                  if (button?.isConnected && !button.disabled) button.focus();
                }}
              />

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
                description={proposalUnsavedChangesDescription}
                onOpenChange={(open) => {
                  if (!open) cancelProposalAction();
                }}
                onSave={() => {
                  void saveAndContinueProposalAction();
                }}
                onDiscard={discardAndContinueProposalAction}
                isSaving={isSaving}
              />

              <ApproveProposalOptionModal
                open={isApproveOptionModalOpen}
                onOpenChange={(open) => {
                  if (!open) closeApproveOptionModal();
                }}
                selectedOptionIndex={optionIndex}
                onApprove={() => {
                  void confirmApproveOption();
                }}
                isPending={isApprovingOption}
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  restoreApproveButtonFocus();
                }}
              />

              <UnsavedChangesModal
                open={isApproveUnsavedChangesModalOpen}
                description={proposalApproveUnsavedChangesDescription}
                onOpenChange={(open) => {
                  if (!open) cancelApprovePreparation();
                }}
                onSave={() => {
                  void saveBeforeApprove();
                }}
                onDiscard={discardBeforeApprove}
                isSaving={isSaving || isPreparingApproval}
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  restoreApproveButtonFocus();
                }}
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
