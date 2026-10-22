import { useRef } from "react";
import { Sheet, type SheetProps } from "@/shared/ui/v2/sheet-v2";
import { Button } from "@/shared/ui/v2/button-v2";
import { UnsavedChangesModal } from "../unsaved-changes-modal/unsaved-changes-modal.tsx";
import { CampaignWhatsAppSection } from "./campaign-whatsapp-section.tsx";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCampaignWhatsAppAttempts } from "@/features/campaign-management/send-campaign-whatsapp";

import DownloadIcon from "@/shared/assets/icons/download.svg?react";
import PauseIcon from "@/shared/assets/icons/pause.svg?react";
import CheckIcon from "@/shared/assets/icons/check-circle.svg?react";
import RefreshIcon from '@/shared/assets/icons/refresh.svg?react';

import s from "./campaign-menu.module.scss";

interface CampaignMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  accounts: ICampaignDetails["addedAccounts"];
  onCloseAutoFocus?: SheetProps["onCloseAutoFocus"];
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  isSaving: boolean;
  isMenuBusy: boolean;
  isSendingWhatsApp: boolean;
  whatsAppAttempts: TCampaignWhatsAppAttempts;
  isChangingCampaignStatus: boolean;
  isMenuConfirmationOpen: boolean;
  canSendWhatsApp: boolean;
  canCloseCampaign: boolean;
  canReopenCampaign: boolean;
  onCloseCampaign: () => void;
  onReopenCampaign: () => void;
  onCancelMenuAction: () => void;
  onSendWhatsApp: () => void;
  onSaveAndContinueMenuAction: () => void;
  onDiscardAndContinueMenuAction: () => void;
}

export const CampaignMenu = ({
  open,
  onOpenChange,
  campaignName,
  accounts,
  onCloseAutoFocus,
  onDownloadPdf,
  isDownloadingPdf,
  isSaving,
  isMenuBusy,
  isChangingCampaignStatus,
  isMenuConfirmationOpen,
  canCloseCampaign,
  canReopenCampaign,
  canSendWhatsApp,
  isSendingWhatsApp,
  whatsAppAttempts,
  onCloseCampaign,
  onReopenCampaign,
  onCancelMenuAction,
  onSaveAndContinueMenuAction,
  onDiscardAndContinueMenuAction,
  onSendWhatsApp,
}: CampaignMenuProps) => {
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const actionsTitleRef = useRef<HTMLHeadingElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const sendWhatsAppButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationTriggerRef = useRef<"pdf" | "status" | "whatsapp">("pdf");
  
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && (isMenuConfirmationOpen || isChangingCampaignStatus)) {
          return;
        }

        onOpenChange(nextOpen);
      }}
      title="Campaign menu"
      description={campaignName}
      className={s.panel}
      bodyClassName={s.body}
      onCloseAutoFocus={onCloseAutoFocus}
      footer={
        canCloseCampaign || canReopenCampaign ? (
          <div className={s.footerContent}>
            <span className={s.footerLabel}>
              Campaign management
            </span>
            
            <Button
              ref={statusButtonRef}
              variant={canCloseCampaign ? "danger" : "primary"}
              label={canCloseCampaign ? "Close campaign" : "Reopen campaign"}
              loadingLabel={canCloseCampaign ? "Closing…" : "Reopening…"}
              icon={canCloseCampaign ? CheckIcon : RefreshIcon}
              isLoading={isChangingCampaignStatus}
              disabled={isMenuBusy}
              onClick={() => {
                confirmationTriggerRef.current = "status";

                if (canCloseCampaign) {
                  onCloseCampaign();
                } else {
                  onReopenCampaign();
                }
              }}
            />
          </div>
        ) : undefined
      }
    >
      <section className={s.actionsSection}>
        <h3
          ref={actionsTitleRef}
          tabIndex={-1}
          className={s.sectionLabel}
        >
          Campaign actions
        </h3>

        <div className={s.actions}>
          <Button
            ref={downloadButtonRef}
            label="Download PDF"
            loadingLabel="Downloading…"
            isLoading={isDownloadingPdf}
            icon={DownloadIcon}
            onClick={() => {
              confirmationTriggerRef.current = "pdf";
              onDownloadPdf();
            }}
            disabled={isMenuBusy}
          />

          {!canReopenCampaign && (
            <Button 
              label="Pause campaign"
              icon={PauseIcon}
              title={"Pause campaign is not available yet"}
              disabled
            />
          )}
        </div>
      </section>

      <CampaignWhatsAppSection
        accounts={accounts}
        whatsAppAttempts={whatsAppAttempts}
        canSendWhatsApp={canSendWhatsApp}
        isSendingWhatsApp={isSendingWhatsApp}
        isMenuBusy={isMenuBusy}
        sendWhatsAppButtonRef={sendWhatsAppButtonRef}
        onSendWhatsApp={() => {
          confirmationTriggerRef.current = "whatsapp";
          onSendWhatsApp();
        }}
      />

      <UnsavedChangesModal
        open={isMenuConfirmationOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onCancelMenuAction();
        }}
        onSave={onSaveAndContinueMenuAction}
        onDiscard={onDiscardAndContinueMenuAction}
        isSaving={isSaving}
        layer="above-sheet"
        onCloseAutoFocus={(event) => {
          event.preventDefault();

          const button =
            confirmationTriggerRef.current === "pdf"
              ? downloadButtonRef.current
              : confirmationTriggerRef.current === "whatsapp"
                ? sendWhatsAppButtonRef.current
                : statusButtonRef.current;

          if (button && !button.disabled) {
            button.focus();
          } else {
            actionsTitleRef.current?.focus();
          }
        }}
      />
    </Sheet>
  );
};
